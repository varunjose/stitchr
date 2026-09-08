(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let motionPaused = motionPreference.matches;
  let activeCase = 'kitchen';
  let running = false;
  let runToken = 0;
  let caseCounts = { kitchen: 0, store: 0, service: 0 };
  const formatMoney = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

  const cases = {
    kitchen: {
      brand: 'Bloom Kitchen', initial: 'b.', mark: '', caption: 'Good food. A smoother operation.',
      receiptLabel: 'ORDER #1049', receiptTitle: 'Lunch rush, handled.', receiptCopy: 'Paid → Preparing → Ready for pickup',
      title: 'From “Order up!”\nto all caught up.',
      description: 'An order comes in. Payment clears. The kitchen gets a ticket and the customer gets an update.',
      benefits: [
        ['One simple ordering experience', 'A menu, checkout, and order status in one app.'],
        ['A calmer kitchen', 'Paid orders go straight to your team’s queue.'],
        ['The whole picture', 'See sales, active orders, and customer questions.']
      ],
      cta: 'Try the kitchen dashboard', greeting: 'Let’s make it a good one.', records: 'Orders',
      metric: 'Orders today', note: '12 ready for pickup', total: 48, revenue: 1284, questions: 24,
      recordTitle: 'Latest orders', recordColumn: 'Order', runLabel: 'Run a sample order',
      sampleNoun: 'order', recordPrefix: '#', nextId: 1049, amount: 28, finalStatus: 'Preparing',
      customers: ['Alex Morgan', 'Sam Taylor', 'Jordan Lee'],
      rows: [['#1048', 'Alex Morgan', 'Ready', 28], ['#1047', 'Sam Taylor', 'Preparing', 42], ['#1046', 'Jordan Lee', 'Collected', 18]],
      steps: [['Payment confirmed', 'Stripe received $28.00'], ['Kitchen ticket created', 'Order saved in Supabase'], ['Team & customer updated', 'Slack + AI assistant']],
      begin: 'A new lunch order is on its way. Watch each tool do its part.',
      done: 'All stitched up. Payment confirmed, kitchen ticket created, and team and customer notified.'
    },
    store: {
      brand: 'Form & Field', initial: 'f.', mark: 'form.', caption: 'Small finds. A connected storefront.',
      receiptLabel: 'ORDER #2051', receiptTitle: 'From cart to customer.', receiptCopy: 'Checkout → Inventory → Fulfillment',
      title: 'More orders.\nFewer moving parts.',
      description: 'A purchase updates payments, inventory, and fulfillment. Your storefront and team stay in step.',
      benefits: [
        ['A smooth path to checkout', 'Products, payment, and order updates in one place.'],
        ['A connected back office', 'New purchases become clear fulfillment tasks.'],
        ['A view beyond the sale', 'Follow revenue, customer activity, and open orders.']
      ],
      cta: 'Try the store dashboard', greeting: 'Your store, in good shape.', records: 'Orders',
      metric: 'Orders today', note: '8 ready to fulfill', total: 32, revenue: 2460, questions: 18,
      recordTitle: 'Latest purchases', recordColumn: 'Order', runLabel: 'Run a sample purchase',
      sampleNoun: 'purchase', recordPrefix: '#', nextId: 2051, amount: 64, finalStatus: 'Packing',
      customers: ['Riley Chen', 'Avery Davis', 'Jamie Patel'],
      rows: [['#2050', 'Riley Chen', 'Packing', 64], ['#2049', 'Avery Davis', 'Shipped', 92], ['#2048', 'Jamie Patel', 'Delivered', 36]],
      steps: [['Payment confirmed', 'Stripe received $64.00'], ['Inventory updated', 'Purchase saved in Supabase'], ['Fulfillment notified', 'Slack + customer update']],
      begin: 'A customer just checked out. Follow the purchase through your connected tools.',
      done: 'All stitched up. Payment confirmed, inventory updated, and fulfillment and customer notified.'
    },
    service: {
      brand: 'Studio North', initial: 'n.', mark: 'north.', caption: 'Great client work. Less admin.',
      receiptLabel: 'BOOKING #3063', receiptTitle: 'A great first impression.', receiptCopy: 'Booking → Deposit → Welcome',
      title: 'From first booking\nto a better client experience.',
      description: 'A booking records the deposit, creates a client profile, and sends your team the brief.',
      benefits: [
        ['An easier welcome', 'Let clients book, pay, and find their next steps.'],
        ['Fewer follow-up chores', 'Turn a booking into a ready-to-use client record.'],
        ['A clear workload', 'See bookings, payments, and client questions together.']
      ],
      cta: 'Try the service dashboard', greeting: 'Make room for your best work.', records: 'Bookings',
      metric: 'Bookings today', note: '4 upcoming consultations', total: 12, revenue: 1800, questions: 9,
      recordTitle: 'Latest bookings', recordColumn: 'Booking', runLabel: 'Run a sample booking',
      sampleNoun: 'booking', recordPrefix: '#', nextId: 3063, amount: 150, finalStatus: 'Confirmed',
      customers: ['Casey Wilson', 'Drew Parker', 'Taylor Kim'],
      rows: [['#3062', 'Casey Wilson', 'Confirmed', 150], ['#3061', 'Drew Parker', 'Upcoming', 150], ['#3060', 'Taylor Kim', 'Completed', 200]],
      steps: [['Deposit confirmed', 'Stripe received $150.00'], ['Client record created', 'Booking saved in Supabase'], ['Welcome sent', 'Team brief + client next steps']],
      begin: 'A client just booked a consultation. Follow the details from payment to welcome.',
      done: 'All stitched up. Deposit confirmed, client record created, and welcome and team brief sent.'
    }
  };

  // Navigation remains usable without JavaScript; this only controls the mobile menu.
  const menu = $('.menu-toggle');
  const nav = $('#main-nav');
  const closeMenu = () => {
    nav.classList.remove('is-open');
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Open menu');
  };
  menu.addEventListener('click', () => {
    const opening = menu.getAttribute('aria-expanded') !== 'true';
    nav.classList.toggle('is-open', opening);
    menu.setAttribute('aria-expanded', String(opening));
    menu.setAttribute('aria-label', opening ? 'Close menu' : 'Open menu');
  });
  $$('a', nav).forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menu.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!$('.site-header').contains(event.target)) closeMenu();
  });

  const text = (selector, value) => { $(selector).textContent = value; };
  const create = (tag, className, value) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (value !== undefined) element.textContent = value;
    return element;
  };

  const buildRow = ([id, customer, status, amount], isNew = false) => {
    const row = create('tr', isNew ? 'new-record' : '');
    row.append(create('td', '', id), create('td', '', customer));
    const statusCell = create('td');
    const waiting = ['Preparing', 'Packing', 'Upcoming', 'Processing'].includes(status);
    statusCell.append(create('span', `table-status ${waiting ? 'preparing' : 'ready'}`, status));
    row.append(statusCell, create('td', '', `$${amount.toFixed(2)}`));
    [...row.children].forEach((cell, index) => cell.dataset.label = ['Reference', 'Customer', 'Status', 'Amount'][index]);
    return row;
  };

  const renderSteps = (data, completed = 3, active = -1) => {
    const list = $('#activity-list');
    list.replaceChildren(...data.steps.map(([title, detail], index) => {
      const item = create('li', index === active ? 'active' : index >= completed ? 'pending' : '');
      item.append(create('span', 'activity-check', index < completed ? '✓' : index === active ? '·' : String(index + 1)));
      const content = create('div');
      content.append(create('b', '', title), create('span', '', detail));
      item.append(content);
      return item;
    }));
  };

  const renderDashboard = () => {
    const data = cases[activeCase];
    const count = caseCounts[activeCase];
    text('#dashboard-brand', data.brand);
    text('#dashboard-brand-initial', data.initial);
    text('#dashboard-greeting', data.greeting);
    text('#sidebar-records', data.records);
    text('#sidebar-count', data.total + count);
    text('#metric-label-one', data.metric);
    text('#metric-note-one', data.note);
    text('#metric-orders', data.total + count);
    text('#metric-revenue', formatMoney(data.revenue + count * data.amount));
    text('#metric-questions', data.questions);
    text('#records-title', data.recordTitle);
    text('#record-col', data.recordColumn);
    text('#run-demo-label', data.runLabel);
    const newRows = Array.from({ length: Math.min(count, 3) }, (_, index) => [
      data.recordPrefix + (data.nextId + count - index - 1),
      data.customers[(count - index - 1) % data.customers.length], data.finalStatus, data.amount
    ]);
    $('#records-body').replaceChildren(...[...newRows, ...data.rows].slice(0, 3).map(row => buildRow(row)));
    renderSteps(data);
    text('#demo-status', `Run a sample ${data.sampleNoun} to follow the workflow.`);
    $('.run-demo').disabled = false;
  };

  const selectCase = key => {
    if (!Object.hasOwn(cases, key)) return;
    runToken += 1;
    running = false;
    activeCase = key;
    const data = cases[key];
    $$('[data-case]').forEach(tab => {
      const selected = tab.dataset.case === key;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    $('#case-panel').setAttribute('aria-labelledby', `tab-${key}`);
    text('#case-brand', data.brand);
    text('#case-scene-caption', data.caption);
    text('#scene-receipt-label', data.receiptLabel);
    text('#scene-receipt-title', data.receiptTitle);
    text('#scene-receipt-copy', data.receiptCopy);
    $('#case-title').replaceChildren(...data.title.split('\n').flatMap((line, index) => index ? [document.createElement('br'), document.createTextNode(line)] : [document.createTextNode(line)]));
    text('#case-description', data.description);
    $('#case-benefits').replaceChildren(...data.benefits.map(([title, detail], index) => {
      const row = create('div');
      row.append(create('span', '', `0${index + 1}`));
      const paragraph = create('p');
      paragraph.append(create('b', '', title), document.createTextNode(detail));
      row.append(paragraph);
      return row;
    }));
    $('#case-demo-link').replaceChildren(document.createTextNode(data.cta + ' '), create('span', '', '↗'));
    $('#case-demo-link span').setAttribute('aria-hidden', 'true');
    $('.case-scene').classList.toggle('alternate-scene', key !== 'kitchen');
    $('.case-scene').dataset.sceneMark = data.mark;
    $('#case-image').alt = key === 'kitchen' ? 'A cook preparing a fresh lunch bowl at a bright café counter' : '';
    $('#case-image').hidden = key !== 'kitchen';
    renderDashboard();
  };

  const tabs = $$('[data-case]');
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectCase(tab.dataset.case));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        selectCase(tabs[next].dataset.case);
        tabs[next].focus();
      }
    });
  });

  const delay = duration => new Promise(resolve => window.setTimeout(resolve, motionPaused ? 90 : duration));
  $('.run-demo').addEventListener('click', async () => {
    if (running) return;
    running = true;
    const token = ++runToken;
    const key = activeCase;
    const data = cases[key];
    const count = caseCounts[key];
    const button = $('.run-demo');
    button.disabled = true;
    text('#run-demo-label', 'Stitching it together…');
    text('#demo-status', data.begin);
    renderSteps(data, 0, 0);
    await delay(850);
    if (token !== runToken) return;
    text('#metric-revenue', formatMoney(data.revenue + (count + 1) * data.amount));
    text('#demo-status', `${data.steps[0][0]}. Next, the details are passed to your database.`);
    renderSteps(data, 1, 1);
    await delay(850);
    if (token !== runToken) return;
    const row = buildRow([data.recordPrefix + (data.nextId + count), data.customers[count % data.customers.length], data.finalStatus, data.amount], true);
    $('#records-body').prepend(row);
    while ($('#records-body').children.length > 3) $('#records-body').lastElementChild.remove();
    text('#metric-orders', data.total + count + 1);
    text('#sidebar-count', data.total + count + 1);
    text('#demo-status', `${data.steps[1][0]}. Now your team and customer get the update.`);
    renderSteps(data, 2, 2);
    await delay(850);
    if (token !== runToken) return;
    caseCounts[key] += 1;
    renderSteps(data, 3);
    text('#demo-status', data.done);
    text('#run-demo-label', `Run another ${data.sampleNoun}`);
    button.disabled = false;
    running = false;
  });

  // One geometric thread follows the story. Only the stroke and needle change per frame.
  const runway = $('.story-runway');
  const svg = $('.story-svg');
  const guide = $('.story-thread-guide');
  const thread = $('.story-thread-active');
  const needle = $('.scroll-needle');
  const storySteps = $$('[data-stitch]');
  let pathLength = 0;
  let storyTop = 0;
  let storyHeight = 1;
  let thresholds = [];
  let scrollFrame = 0;
  let resizeFrame = 0;

  const updateThread = () => {
    scrollFrame = 0;
    if (!pathLength) return;
    const progress = Math.min(1, Math.max(0, (window.scrollY + window.innerHeight * .7 - storyTop) / Math.max(1, storyHeight - 140)));
    const drawn = motionPaused ? 1 : progress;
    thread.style.strokeDashoffset = String(pathLength * (1 - drawn));
    if (!motionPaused) {
      const distance = pathLength * drawn;
      const point = thread.getPointAtLength(distance);
      const ahead = thread.getPointAtLength(Math.min(pathLength, distance + 3));
      const behind = thread.getPointAtLength(Math.max(0, distance - 3));
      const angle = Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180 / Math.PI;
      needle.setAttribute('transform', `translate(${point.x} ${point.y}) rotate(${angle})`);
      needle.style.opacity = progress <= 0 || progress >= 1 ? '0' : '1';
    }
    storySteps.forEach((step, index) => step.classList.toggle('is-stitched', motionPaused || progress >= thresholds[index]));
  };
  const scheduleThread = () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateThread); };

  const measureThread = () => {
    resizeFrame = 0;
    const rect = runway.getBoundingClientRect();
    const width = rect.width;
    storyHeight = rect.height;
    storyTop = rect.top + window.scrollY;
    svg.setAttribute('viewBox', `0 0 ${width} ${storyHeight}`);
    thresholds = storySteps.map(step => (step.offsetTop + Math.min(step.offsetHeight * .45, 230)) / Math.max(1, storyHeight - 140));
    const mobile = width <= 720;
    let d;
    if (mobile) {
      const edge = width < 390 ? 15 : 21;
      d = `M ${width / 2} 0 C ${width / 2} 28, ${edge} 0, ${edge} 56`;
      for (let i = 0; i < 3; i++) {
        const step = storySteps[i];
        const y = step.offsetTop + step.offsetHeight * .52;
        d += ` C ${edge} ${y - 90}, ${edge + 24} ${y - 55}, ${edge} ${y} S ${edge - 6} ${y + 70}, ${edge} ${y + 100}`;
      }
      const last = storySteps[3];
      const end = last.offsetTop + 85;
      d += ` C ${edge} ${end - 60}, ${width / 2} ${end - 95}, ${width / 2} ${end}`;
    } else {
      const panelRects = $$('.story-visual').map(panel => panel.getBoundingClientRect());
      const positions = panelRects.map((panel, index) => ({ x: index === 1 ? panel.left - rect.left - 23 : panel.right - rect.left + 23, y: panel.top - rect.top + panel.height * .52 }));
      d = `M ${width * .52} 0`;
      let previous = { x: width * .52, y: 0 };
      positions.forEach((point, index) => {
        const direction = index === 1 ? -1 : 1;
        const outer = Math.min(width - 12, Math.max(12, point.x + direction * 46));
        const mid = (previous.y + point.y) / 2;
        d += ` C ${previous.x} ${mid}, ${outer} ${mid - 75}, ${point.x} ${point.y - 30}`;
        d += ` C ${point.x - direction * 27} ${point.y + 5}, ${outer} ${point.y + 57}, ${point.x} ${point.y + 88}`;
        previous = { x: point.x, y: point.y + 88 };
      });
      const last = storySteps[3];
      const end = last.offsetTop + 95;
      d += ` C ${previous.x} ${end - 90}, ${width / 2} ${end - 150}, ${width / 2} ${end}`;
    }
    guide.setAttribute('d', d);
    thread.setAttribute('d', d);
    pathLength = thread.getTotalLength();
    thread.style.strokeDasharray = String(pathLength);
    updateThread();
  };
  const scheduleMeasure = () => { if (!resizeFrame) resizeFrame = requestAnimationFrame(measureThread); };
  window.addEventListener('scroll', scheduleThread, { passive: true });
  window.addEventListener('resize', () => {
    scheduleMeasure();
    if (window.innerWidth > 720) closeMenu();
  }, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(scheduleMeasure).observe(runway);

  const applyMotion = () => {
    document.documentElement.classList.toggle('motion-paused', motionPaused);
    $('.motion-toggle').setAttribute('aria-pressed', String(motionPaused));
    $('.motion-toggle').textContent = motionPaused ? 'Enable animation' : 'Pause animation';
    updateThread();
    if (motionPaused && !heroFinished) finishHero();
  };
  $('.motion-toggle').addEventListener('click', () => {
    motionPaused = !motionPaused;
    applyMotion();
  });
  motionPreference.addEventListener('change', event => {
    motionPaused = event.matches;
    applyMotion();
  });

  const heroPath = $('.hero-thread-line');
  const heroNeedle = $('.hero-travel-needle');
  const heroCanvas = $('.hero-canvas');
  heroCanvas.classList.add('stitch-pending');
  let heroFrame = 0;
  let heroStarted = 0;
  let heroFinished = false;
  const heroLength = heroPath.getTotalLength();
  heroPath.style.strokeDasharray = String(heroLength);
  const finishHero = () => {
    cancelAnimationFrame(heroFrame);
    heroFinished = true;
    heroPath.style.strokeDashoffset = '0';
    heroNeedle.style.opacity = '0';
    heroCanvas.classList.add('stitch-complete');
    heroCanvas.classList.remove('stitch-pending');
    document.documentElement.classList.add('intro-complete');
  };
  const animateHero = now => {
    if (motionPaused) { finishHero(); return; }
    if (!heroStarted) heroStarted = now;
    const p = Math.min(1, Math.max(0, (now - heroStarted - 1100) / 2600));
    heroPath.style.strokeDashoffset = String(heroLength - Math.max(0, heroLength * p - 75));
    const point = heroPath.getPointAtLength(heroLength * p);
    const next = heroPath.getPointAtLength(Math.min(heroLength, heroLength * p + 2));
    const angle = Math.atan2(next.y - point.y, next.x - point.x) * 180 / Math.PI;
    heroNeedle.setAttribute('transform', `translate(${point.x} ${point.y}) rotate(${angle})`);
    heroNeedle.style.opacity = p > 0 && p < 1 ? '1' : '0';
    heroCanvas.style.setProperty('--stitch-progress', p);
    if (p > .05) document.documentElement.classList.add('intro-complete');
    if (p > .55) heroCanvas.classList.add('app-stitching');
    if (p === 1) { finishHero(); return; }
    heroFrame = requestAnimationFrame(animateHero);
  };
  if (motionPaused) finishHero();
  else heroFrame = requestAnimationFrame(animateHero);
  $$('.dashboard-table-wrap tbody tr').forEach(row => [...row.children].forEach((cell, index) => cell.dataset.label = ['Reference', 'Customer', 'Status', 'Amount'][index]));
  const revealTargets = $$('.step-copy,.story-visual,.case-panel,.integration-tile,.why-grid article');
  if ('IntersectionObserver' in window) {
    const ambient = new IntersectionObserver(entries => entries.forEach(entry => {
      entry.target.classList.toggle('outside-viewport', !entry.isIntersecting);
    }), { rootMargin: '120px' });
    $$('.hero,.stitch-story,.closing').forEach(section => ambient.observe(section));
  }
  if ('IntersectionObserver' in window && !motionPaused) {
    const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('revealed'); reveal.unobserve(entry.target); }
    }), { threshold: .12 });
    revealTargets.forEach((target, index) => { target.classList.add('reveal-ready'); target.style.setProperty('--reveal-delay', `${Math.min(index % 3, 2) * 70}ms`); reveal.observe(target); });
  }

  text('#year', new Date().getFullYear());
  if ('IntersectionObserver' in window && !motionPaused) {
    const dashboard = $('.dashboard-app');
    dashboard.classList.add('will-assemble');
    const assemble = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        dashboard.classList.add('is-assembled');
        assemble.disconnect();
      }
    }, { threshold: .15 });
    assemble.observe(dashboard);
  }
  applyMotion();
  measureThread();
  window.addEventListener('load', scheduleMeasure, { once: true });
})();

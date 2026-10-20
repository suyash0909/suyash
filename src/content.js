const topics = [
  {
    title: 'Stop copying leads between tools',
    pain: 'Your team receives a lead, opens three tools, and manually copies the same details again and again.',
    solution: 'Connect the form, CRM, email, and notification flow so every lead is routed automatically.',
    result: 'Faster response, fewer missed leads, and a cleaner pipeline.',
    cta: 'What is your team still copying by hand?'
  },
  {
    title: 'Automate client onboarding',
    pain: 'New clients wait while your team sends the same emails, forms, reminders, and folders manually.',
    solution: 'Trigger a branded onboarding workflow the moment a deal is marked won.',
    result: 'A consistent first impression without adding admin work.',
    cta: 'DM Zavrik: ONBOARDING'
  },
  {
    title: 'Your spreadsheet is not a workflow',
    pain: 'A spreadsheet can track work, but it cannot reliably remind owners, validate inputs, or move work forward.',
    solution: 'Turn the sheet into a lightweight workflow with rules, alerts, and dashboards.',
    result: 'Less chasing. More visibility. Better decisions.',
    cta: 'Which spreadsheet task should disappear first?'
  },
  {
    title: 'Follow-ups should not depend on memory',
    pain: 'Opportunities go cold when follow-ups live in someone’s head or a forgotten notebook.',
    solution: 'Use event-based reminders and personalised messages tied to each customer stage.',
    result: 'A reliable process that still feels human.',
    cta: 'Save this for your next sales-process review.'
  }
];

function pickTopic(date = new Date()) {
  const day = Math.floor(date.getTime() / 86_400_000);
  return topics[((day % topics.length) + topics.length) % topics.length];
}

export async function createContent({ slideCount, date = new Date() }) {
  const topic = pickTopic(date);
  const slides = [
    { heading: topic.title, body: 'A practical Zavrik guide for teams ready to work smarter.' },
    { heading: 'The hidden cost', body: topic.pain },
    { heading: 'Why it keeps happening', body: 'Disconnected tools and repetitive handoffs turn simple work into daily admin.' },
    { heading: 'The automation move', body: topic.solution },
    { heading: 'A simple flow', body: 'Trigger → check → update → notify. One clear workflow, fewer manual steps.' },
    { heading: 'What changes', body: topic.result },
    { heading: 'Start small', body: 'Pick one repeatable process. Measure the time saved. Improve it every week.' },
    { heading: 'Decide urself', body: topic.cta }
  ];
  return {
    topic: topic.title,
    caption: `${topic.title}\n\n${topic.pain}\n\nThe better move: ${topic.solution}\n\n${topic.result}\n\n${topic.cta}\n\nZavrik — Decide urself.\n\n#BusinessAutomation #WorkflowAutomation #SmallBusiness #NoCode #Zavrik`,
    slides: slides.slice(0, slideCount)
  };
}

/**
 * Verbal ability. Hand-written, original items. Each table row is shaped into a question.
 * Rows: [word, correct, wrong1, wrong2, wrong3, (optional note)]
 */
import { mcq, rng, shuffle } from './lib.mjs';
import { ANT2, IDIOMS2, ONE_WORD, SENTENCE, SPELL, SYN2 } from './verbal-more.mjs';
import { ERR2, FILL2, JUMBLES2, RC2, SENTENCE2, SPELL2 } from './verbal-more2.mjs';

const J2 = JUMBLES2.map(([order, ...rest]) => { const hint = rest.pop(); const o = {}; [...order].forEach((k, i) => { o[k] = rest[i]; }); return [{ P: o.P, Q: o.Q, R: o.R, S: o.S }, order, `${order.split('').join(' → ')}: ${hint}`]; });

const SYN = [
  ['Abundant', 'Plentiful', 'Scarce', 'Narrow', 'Silent'], ['Candid', 'Frank', 'Secretive', 'Careful', 'Rude'], ['Diligent', 'Hard-working', 'Lazy', 'Clever', 'Polite'],
  ['Feeble', 'Weak', 'Strong', 'Brave', 'Quick'], ['Hostile', 'Unfriendly', 'Kind', 'Calm', 'Neutral'], ['Lucid', 'Clear', 'Confusing', 'Bright', 'Long'],
  ['Meticulous', 'Very careful', 'Careless', 'Fast', 'Generous'], ['Obsolete', 'Outdated', 'Modern', 'Rare', 'Useful'], ['Prudent', 'Wise', 'Reckless', 'Proud', 'Slow'],
  ['Reluctant', 'Unwilling', 'Eager', 'Late', 'Sad'], ['Tranquil', 'Peaceful', 'Noisy', 'Cold', 'Empty'], ['Vivid', 'Bright', 'Dull', 'Small', 'Strange'],
  ['Zeal', 'Enthusiasm', 'Boredom', 'Anger', 'Fear'], ['Benevolent', 'Kind', 'Cruel', 'Rich', 'Clever'], ['Concise', 'Brief', 'Lengthy', 'Vague', 'Loud'],
  ['Elated', 'Overjoyed', 'Depressed', 'Tired', 'Confused'], ['Frugal', 'Thrifty', 'Wasteful', 'Poor', 'Greedy'], ['Gigantic', 'Huge', 'Tiny', 'Heavy', 'Tall'],
  ['Hamper', 'Hinder', 'Help', 'Hurry', 'Hide'], ['Imminent', 'About to happen', 'Distant', 'Important', 'Famous'], ['Jovial', 'Cheerful', 'Gloomy', 'Serious', 'Shy'],
  ['Lament', 'Mourn', 'Celebrate', 'Explain', 'Shout'], ['Novice', 'Beginner', 'Expert', 'Teacher', 'Critic'], ['Ominous', 'Threatening', 'Hopeful', 'Huge', 'Funny'],
  ['Placid', 'Calm', 'Agitated', 'Plain', 'Pale'], ['Rigid', 'Stiff', 'Flexible', 'Rough', 'Fragile'], ['Scrutinize', 'Examine closely', 'Ignore', 'Praise', 'Copy'],
  ['Tedious', 'Boring', 'Exciting', 'Difficult', 'Short'], ['Vacant', 'Empty', 'Occupied', 'Wide', 'Clean'], ['Wary', 'Cautious', 'Careless', 'Tired', 'Angry'],
  ['Adversary', 'Opponent', 'Friend', 'Leader', 'Judge'], ['Brisk', 'Quick', 'Slow', 'Cold', 'Bitter'], ['Conceal', 'Hide', 'Reveal', 'Collect', 'Destroy'],
  ['Durable', 'Long-lasting', 'Fragile', 'Expensive', 'Light'], ['Eminent', 'Distinguished', 'Unknown', 'Ordinary', 'Nearby'], ['Fatigue', 'Tiredness', 'Energy', 'Hunger', 'Illness'],
  ['Inevitable', 'Unavoidable', 'Unlikely', 'Optional', 'Sudden'], ['Mend', 'Repair', 'Break', 'Sell', 'Clean'], ['Pinnacle', 'Peak', 'Base', 'Middle', 'Slope'],
  ['Augment', 'Increase', 'Reduce', 'Argue', 'Measure'], ['Commence', 'Begin', 'Finish', 'Pause', 'Delay'], ['Deceive', 'Mislead', 'Guide', 'Inform', 'Trust'],
];
const ANT = [
  ['Ancient', 'Modern', 'Old', 'Historic', 'Antique'], ['Bold', 'Timid', 'Brave', 'Daring', 'Fearless'], ['Expand', 'Contract', 'Grow', 'Spread', 'Extend'],
  ['Generous', 'Stingy', 'Kind', 'Giving', 'Liberal'], ['Humble', 'Arrogant', 'Modest', 'Simple', 'Meek'], ['Optimist', 'Pessimist', 'Dreamer', 'Idealist', 'Believer'],
  ['Permanent', 'Temporary', 'Lasting', 'Fixed', 'Stable'], ['Rare', 'Common', 'Unusual', 'Scarce', 'Unique'], ['Accept', 'Reject', 'Receive', 'Admit', 'Allow'],
  ['Victory', 'Defeat', 'Win', 'Success', 'Triumph'], ['Transparent', 'Opaque', 'Clear', 'Glassy', 'Visible'], ['Increase', 'Decrease', 'Raise', 'Boost', 'Add'],
  ['Natural', 'Artificial', 'Normal', 'Real', 'Organic'], ['Superior', 'Inferior', 'Better', 'Upper', 'Senior'], ['Maximum', 'Minimum', 'Largest', 'Most', 'Peak'],
  ['Shallow', 'Deep', 'Thin', 'Flat', 'Low'], ['Praise', 'Criticise', 'Admire', 'Applaud', 'Honour'], ['Visible', 'Invisible', 'Clear', 'Obvious', 'Seen'],
  ['Wisdom', 'Folly', 'Knowledge', 'Insight', 'Sense'], ['Encourage', 'Discourage', 'Support', 'Inspire', 'Urge'], ['Ascend', 'Descend', 'Climb', 'Rise', 'Mount'],
  ['Barren', 'Fertile', 'Empty', 'Dry', 'Bare'], ['Cautious', 'Reckless', 'Careful', 'Alert', 'Wary'], ['Dense', 'Sparse', 'Thick', 'Heavy', 'Solid'],
  ['Exterior', 'Interior', 'Outside', 'Surface', 'Outer'], ['Fragile', 'Sturdy', 'Delicate', 'Weak', 'Brittle'], ['Guilty', 'Innocent', 'Blamed', 'Sorry', 'Accused'],
  ['Hasty', 'Deliberate', 'Quick', 'Rash', 'Hurried'], ['Import', 'Export', 'Bring', 'Carry', 'Trade'], ['Junior', 'Senior', 'Younger', 'Lower', 'Minor'],
  ['Lenient', 'Strict', 'Gentle', 'Mild', 'Soft'], ['Majority', 'Minority', 'Most', 'Bulk', 'Mass'], ['Noisy', 'Quiet', 'Loud', 'Rowdy', 'Busy'],
  ['Obey', 'Defy', 'Follow', 'Comply', 'Respect'], ['Profit', 'Loss', 'Gain', 'Income', 'Benefit'], ['Quarrel', 'Agree', 'Argue', 'Fight', 'Dispute'],
  ['Sorrow', 'Joy', 'Grief', 'Sadness', 'Pain'], ['Tame', 'Wild', 'Gentle', 'Docile', 'Trained'], ['Vague', 'Precise', 'Unclear', 'Hazy', 'Loose'],
  ['Attack', 'Defend', 'Assault', 'Strike', 'Raid'],
];

// [sentence with ___, correct, wrong x3, explanation]
const FILL = [
  ['She has been working here ___ 2019.', 'since', 'for', 'from', 'by', '"Since" is used with a point in time; "for" with a period.'],
  ['He is good ___ mathematics.', 'at', 'in', 'on', 'with', 'We say "good at" a subject or skill.'],
  ['I prefer tea ___ coffee.', 'to', 'than', 'over than', 'from', '"Prefer A to B" is the standard pattern.'],
  ['Neither the manager nor the employees ___ present.', 'were', 'was', 'is', 'has been', 'With neither…nor, the verb agrees with the nearer subject ("employees").'],
  ['If I ___ you, I would apply for the job.', 'were', 'was', 'am', 'will be', 'Second conditional uses "were" for all subjects.'],
  ['The train ___ by the time we reached the station.', 'had left', 'has left', 'left', 'leaves', 'Past perfect shows the earlier of two past actions.'],
  ['He is ___ honest man.', 'an', 'a', 'the', 'no article', '"Honest" begins with a vowel sound, so "an".'],
  ['Each of the students ___ given a laptop.', 'was', 'were', 'are', 'have been', '"Each" takes a singular verb.'],
  ['She insisted ___ paying the bill.', 'on', 'for', 'at', 'to', 'The verb "insist" takes "on".'],
  ['We have run out ___ sugar.', 'of', 'from', 'off', 'with', 'The phrasal verb is "run out of".'],
  ['The meeting has been put ___ until Friday.', 'off', 'on', 'up', 'out', '"Put off" means postpone.'],
  ['He has ___ finished his assignment.', 'just', 'yet', 'still', 'ago', '"Just" fits the present perfect for a very recent action.'],
  ['She is the ___ student in the class.', 'tallest', 'taller', 'most tall', 'tall', 'Superlative of a one-syllable adjective: -est.'],
  ['I look forward to ___ from you.', 'hearing', 'hear', 'heard', 'be hearing', '"Look forward to" is followed by a gerund.'],
  ['The committee ___ divided in its opinion.', 'was', 'were being', 'are', 'have', 'A collective noun acting as one unit takes a singular verb here.'],
  ['Hardly had he arrived ___ it started raining.', 'when', 'than', 'then', 'that', '"Hardly … when" is the correct pair.'],
  ['No sooner had the bell rung ___ the students rushed out.', 'than', 'when', 'then', 'as', '"No sooner … than" is the correct pair.'],
  ['He apologised ___ being late.', 'for', 'of', 'about', 'on', '"Apologise for" something.'],
  ['The news ___ very encouraging.', 'is', 'are', 'were', 'have been', '"News" is an uncountable singular noun.'],
  ['She speaks English ___ than her brother.', 'more fluently', 'most fluently', 'fluent', 'more fluent', 'A comparative adverb is needed to describe "speaks".'],
  ['By next year, they ___ the bridge.', 'will have built', 'will build', 'built', 'have built', 'Future perfect: an action complete before a future time.'],
  ['This is the boy ___ bicycle was stolen.', 'whose', 'who', 'whom', 'which', '"Whose" shows possession.'],
  ['He was accused ___ stealing the money.', 'of', 'for', 'with', 'about', '"Accused of" is the correct preposition.'],
  ['I have known him ___ ten years.', 'for', 'since', 'from', 'during', '"For" is used with a length of time.'],
  ['She is senior ___ me by two years.', 'to', 'than', 'from', 'over', 'Latin comparatives like senior and junior take "to".'],
  ['She was blamed ___ the delay, though it was not her fault.', 'for', 'of', 'with', 'about', 'We blame someone "for" something.'],
  ['The police ___ arrived at the scene.', 'have', 'has', 'is', 'was', '"Police" is a plural noun.'],
  ['Mathematics ___ my favourite subject.', 'is', 'are', 'were', 'have been', 'Subject names ending in -s are singular.'],
  ['He walked ___ the room without saying a word.', 'out of', 'out from', 'off of', 'away of', '"Walk out of" a place.'],
  ['You ___ submit the form before Monday; it is compulsory.', 'must', 'may', 'might', 'could', '"Must" expresses obligation.'],
];

// Error spotting: [part A, B, C, correct option (A|B|C|No error), explanation]
const ERR = [
  ['Each of the boys', 'have completed', 'their project.', 'B', '"Each" is singular, so "has completed".'],
  ['She is one of the best singer', 'that the college', 'has ever produced.', 'A', '"One of the best" takes a plural noun: "singers".'],
  ['The boy and his sister', 'was playing', 'in the park.', 'B', 'Two subjects joined by "and" take a plural verb: "were playing".'],
  ['The furnitures in the hall', 'were arranged', 'neatly.', 'A', '"Furniture" is uncountable: "The furniture in the hall was arranged".'],
  ['He did not knew', 'the answer to', 'the question.', 'A', 'After "did not", use the base form: "did not know".'],
  ['Neither of the two answers', 'are', 'correct.', 'B', '"Neither" is singular: "is correct".'],
  ['The quality of the mangoes', 'were not', 'good this year.', 'B', 'The subject is "quality" (singular): "was not".'],
  ['She has gone to the market', 'to buy', 'some vegetables.', 'No error', 'The sentence is correct.'],
  ['If he will come', 'tomorrow, we will', 'discuss the plan.', 'A', 'In an if-clause about the future, use the present tense: "If he comes".'],
  ['The teacher, along with her students,', 'were going', 'to the museum.', 'B', 'The subject is "teacher"; "along with" does not change it: "was going".'],
  ['I have seen him', 'yesterday', 'at the bus stop.', 'A', 'With a past time like "yesterday", use the simple past: "I saw him".'],
  ['He is more cleverer', 'than his', 'elder brother.', 'A', 'Use "cleverer" or "more clever", not both.'],
  ['Ten kilometres', 'are a long distance', 'to walk.', 'B', 'An amount of distance is treated as singular: "is a long distance".'],
  ['The scenery of Kashmir', 'is', 'very beautiful.', 'No error', 'The sentence is correct; "scenery" is uncountable and singular.'],
  ['Please send me', 'the informations', 'as soon as possible.', 'B', '"Information" has no plural form.'],
  ['Gold is more precious', 'than any', 'metal.', 'B', 'Gold is itself a metal, so it should be "than any other metal".'],
  ['Hardly I had reached home', 'when it started', 'to rain heavily.', 'A', 'Inversion is needed: "Hardly had I reached home".'],
  ['The number of students', 'in the class', 'are increasing.', 'C', '"The number of" takes a singular verb: "is increasing".'],
  ['He is senior', 'than me', 'in the office.', 'B', '"Senior" takes "to": "senior to me".'],
  ['They discussed about', 'the problem', 'for hours.', 'A', '"Discuss" takes no preposition: "They discussed the problem".'],
  ['Unless you do not work hard,', 'you will not', 'pass the exam.', 'A', '"Unless" already means "if not": "Unless you work hard".'],
  ['My father, as well as my uncles,', 'is coming', 'to the wedding.', 'No error', 'The subject is "my father"; "as well as" does not change it, so "is" is correct.'],
  ['The cattle', 'is grazing', 'in the field.', 'B', '"Cattle" is plural: "are grazing".'],
  ['She prefers coffee', 'than', 'tea.', 'B', '"Prefer" takes "to": "prefers coffee to tea".'],
  ['Scarcely had the play begun', 'than the lights', 'went out.', 'B', '"Scarcely" pairs with "when", not "than".'],
];

// Idioms: [idiom, meaning, wrong x3]
const IDIOMS = [
  ['Break the ice', 'Start a conversation in an awkward situation', 'Damage something cold', 'End a friendship', 'Win easily'],
  ['A blessing in disguise', 'Something good that first seemed bad', 'A hidden enemy', 'A secret gift', 'A false promise'],
  ['Hit the nail on the head', 'Describe exactly what is causing a problem', 'Hurt yourself by mistake', 'Work very hard', 'Make a loud noise'],
  ['Once in a blue moon', 'Very rarely', 'Every night', 'At midnight', 'During a festival'],
  ['Spill the beans', 'Reveal a secret', 'Waste food', 'Cook badly', 'Make a mess'],
  ['Burn the midnight oil', 'Work or study late into the night', 'Waste money', 'Start a fire', 'Sleep early'],
  ['Cost an arm and a leg', 'Be very expensive', 'Cause an injury', 'Be very cheap', 'Take a long time'],
  ['Under the weather', 'Feeling ill', 'Outdoors in rain', 'Very happy', 'Under pressure'],
  ['Bite off more than you can chew', 'Take on more than you can handle', 'Eat too fast', 'Speak rudely', 'Refuse help'],
  ['The ball is in your court', 'It is your decision or turn to act', 'You are losing the game', 'You have won', 'You are being watched'],
  ['Call it a day', 'Stop working for the day', 'Name a date', 'Start a new task', 'Phone someone daily'],
  ['Get cold feet', 'Become nervous and back out', 'Catch a cold', 'Walk barefoot', 'Feel relaxed'],
  ['A piece of cake', 'Something very easy', 'A small reward', 'A sweet dish', 'A small share'],
  ['Let the cat out of the bag', 'Reveal a secret by mistake', 'Free an animal', 'Lose something', 'Start an argument'],
  ['Beat around the bush', 'Avoid the main topic', 'Garden carefully', 'Search everywhere', 'Win clearly'],
  ['In hot water', 'In trouble', 'Taking a bath', 'Very angry', 'Very busy'],
  ['Keep an eye on', 'Watch carefully', 'Ignore', 'Stare rudely', 'Close your eyes'],
  ['Pull someone\'s leg', 'Joke with or tease someone', 'Hurt someone', 'Help someone walk', 'Trick someone into paying'],
  ['On the same page', 'In agreement', 'Reading together', 'Confused', 'Equally tired'],
  ['Back to square one', 'Starting again from the beginning', 'Moving forward', 'Winning the game', 'Going home'],
  ['Turn a blind eye', 'Deliberately ignore something', 'Lose eyesight', 'Look carefully', 'Wink at someone'],
  ['Add fuel to the fire', 'Make a bad situation worse', 'Cook faster', 'Calm things down', 'Save energy'],
];

// Para jumbles: [title, sentences P,Q,R,S as an object, correct order, explanation]
const JUMBLES = [
  [{ P: 'She opened the laptop and began revising her notes.', Q: 'Riya woke up early on the day of her exam.', R: 'By noon she felt calm and ready.', S: 'After a quick breakfast, she sat at her desk.' }, 'QSPR', 'Wake up (Q) → breakfast and desk (S) → revising (P) → ready by noon (R).'],
  [{ P: 'Water is then pumped to a treatment plant.', Q: 'Rain collects in lakes and reservoirs.', R: 'Finally, clean water reaches homes through pipes.', S: 'There it is filtered and disinfected.' }, 'QPSR', 'Collection (Q) → pumping (P) → treatment there (S) → delivery (R).'],
  [{ P: 'Customers soon started recommending it to friends.', Q: 'A small bakery opened near the college last year.', R: 'Today it has three branches across the city.', S: 'Its fresh bread and fair prices attracted students.' }, 'QSPR', 'Opening (Q) → why people came (S) → word of mouth (P) → growth (R).'],
  [{ P: 'The compiler checks the code for errors.', Q: 'A programmer first writes the source code.', R: 'The program then runs on the computer.', S: 'If there are none, it produces machine code.' }, 'QPSR', 'Write (Q) → compile and check (P) → "none" refers to errors (S) → run (R).'],
  [{ P: 'Seeds were sown before the monsoon arrived.', Q: 'The farmer ploughed his field in May.', R: 'In October the golden crop was harvested.', S: 'Steady rains helped the young plants grow.' }, 'QPSR', 'Plough (Q) → sow (P) → rain and growth (S) → harvest (R).'],
  [{ P: 'He therefore joined an online course.', Q: 'Arjun wanted to learn data science.', R: 'Six months later he built his first model.', S: 'But his college did not offer such a subject.' }, 'QSPR', 'Goal (Q) → obstacle (S) → "therefore" the course (P) → result (R).'],
  [{ P: 'Passengers must reach the airport two hours early.', Q: 'After check-in, they go through security.', R: 'Then they wait at the gate until boarding is announced.', S: 'They first drop their bags at the check-in counter.' }, 'PSQR', 'Arrive early (P) → bags at check-in (S) → security after check-in (Q) → wait for boarding (R).'],
  [{ P: 'It was first used by scientists to share research.', Q: 'The internet began as a small government project.', R: 'Now billions of people use it every day.', S: 'Later, businesses and the public joined in.' }, 'QPSR', 'Origin (Q) → first users (P) → later expansion (S) → today (R).'],
  [{ P: 'The interviewer then asked about her final-year project.', Q: 'Sana walked into the interview room nervously.', R: 'A week later she received the offer letter.', S: 'She began by introducing herself confidently.' }, 'QSPR', 'Enter (Q) → introduction (S) → project question (P) → offer (R).'],
  [{ P: 'The leaves trap sunlight and make food.', Q: 'Plants take in water through their roots.', R: 'Oxygen is released into the air as a by-product.', S: 'Carbon dioxide enters through tiny pores in the leaves.' }, 'QSPR', 'Water in (Q) → CO₂ in (S) → photosynthesis (P) → oxygen out (R).'],
];

// Reading comprehension: original passages, each with questions [q, correct, wrong x3, explanation]
const RC = [
  {
    title: 'Public libraries',
    text: 'Public libraries are often seen as quiet places full of old books, but many have changed a great deal. In several Indian cities, libraries now offer free internet access, coding workshops and spaces where students can prepare for competitive exams. For families who cannot afford books or a home computer, such services make a real difference. However, many libraries struggle with limited funding, and some have reduced their opening hours. Supporters argue that a small public investment in libraries brings large returns, because it helps people gain skills that lead to better jobs.',
    qs: [
      ['What is the main idea of the passage?', 'Libraries have changed and still matter, though funding is a challenge', 'Libraries should stop buying books', 'Libraries are only useful for children', 'Internet access has made libraries useless', 'The passage describes new services, their value and the funding problem.'],
      ['According to the passage, who benefits most from library services?', 'Families who cannot afford books or computers', 'Wealthy families', 'Government officials', 'Book publishers', 'The passage says such services "make a real difference" for these families.'],
      ['What problem do many libraries face?', 'Limited funding', 'Too many visitors', 'Lack of books in English', 'Noise complaints', 'It states that many struggle with limited funding.'],
      ['Which word is closest in meaning to "returns" as used in the passage?', 'Benefits', 'Journeys back', 'Refunds of books', 'Answers', 'Here "returns" means gains or benefits from an investment.'],
    ],
  },
  {
    title: 'Electric buses',
    text: 'Electric buses are becoming common in Indian cities. They produce no exhaust at the point of use, which improves air quality on busy roads, and they are much quieter than diesel buses. Their main drawback is cost: an electric bus can cost twice as much as a diesel one, and charging depots need large investments. To manage this, several state transport corporations lease buses instead of buying them, paying operators per kilometre. Experts say that over a bus\'s lifetime, lower fuel and maintenance costs can balance the higher price.',
    qs: [
      ['Which advantage of electric buses is NOT mentioned?', 'They travel faster than diesel buses', 'They improve air quality', 'They are quieter', 'They have lower fuel costs', 'Speed is never mentioned.'],
      ['How do some transport corporations deal with the high cost?', 'By leasing buses and paying per kilometre', 'By raising ticket prices sharply', 'By buying only second-hand buses', 'By running buses at night only', 'The passage says they lease buses and pay operators per kilometre.'],
      ['What can balance the higher purchase price over time?', 'Lower fuel and maintenance costs', 'Advertising on buses', 'Fewer routes', 'Government fines on diesel buses', 'Experts say lifetime savings on fuel and maintenance balance the price.'],
      ['The tone of the passage is best described as:', 'Balanced and informative', 'Angry', 'Humorous', 'Strongly against electric buses', 'It presents benefits and drawbacks fairly.'],
    ],
  },
  {
    title: 'Learning to code',
    text: 'Many students believe they must master a programming language completely before building anything useful. In practice, the opposite often works better. Small projects, such as a calculator or a to-do list, force learners to look up only what they need, and the effort of fixing real errors fixes concepts in memory. Employers, too, increasingly value a portfolio of working projects over certificates alone. That does not mean theory is unimportant: data structures and algorithms still decide how well a program performs when it grows. The best approach combines both, building often while steadily strengthening the fundamentals.',
    qs: [
      ['What does the author suggest is a common mistake students make?', 'Waiting to master a language before building anything', 'Building too many projects', 'Ignoring certificates', 'Learning too many languages', 'The first sentence describes this belief, which the author disputes.'],
      ['Why are small projects helpful, according to the passage?', 'Fixing real errors helps concepts stick', 'They need no theory at all', 'They are easy to sell', 'Employers ask for calculators', 'The passage says fixing real errors fixes concepts in memory.'],
      ['What role does the author give to theory?', 'It still matters for performance as programs grow', 'It is useless for jobs', 'It should be learned only after getting a job', 'It replaces projects', 'Data structures and algorithms decide performance as programs grow.'],
      ['Which approach does the author recommend?', 'Combining regular building with strengthening fundamentals', 'Only theory', 'Only certificates', 'Only copying projects online', 'The last sentence states this.'],
    ],
  },
  {
    title: 'Millets',
    text: 'Millets such as jowar, bajra and ragi were once everyday food across the Deccan. Over the last few decades, rice and wheat replaced them in many homes, partly because government schemes supplied those grains cheaply. Millets, however, need far less water than rice and grow well in dry regions, which makes them attractive as rainfall becomes less predictable. They are also rich in fibre and minerals. Recently, schools in some states have added millet dishes to midday meals, and start-ups sell ready-to-cook millet products, hoping to win back urban customers.',
    qs: [
      ['Why did rice and wheat replace millets in many homes?', 'Government schemes supplied them cheaply', 'Millets became too expensive to grow', 'Millets were banned', 'People disliked the taste of millets', 'The passage links the change partly to cheap supply through schemes.'],
      ['Which feature makes millets suitable for dry regions?', 'They need far less water', 'They grow only in winter', 'They need fertiliser', 'They are imported', 'The passage says they need far less water than rice.'],
      ['What are start-ups doing, according to the passage?', 'Selling ready-to-cook millet products', 'Exporting rice', 'Opening schools', 'Growing wheat', 'Start-ups sell ready-to-cook millet products.'],
      ['The word "attractive" in the passage most nearly means:', 'Appealing as an option', 'Good-looking', 'Magnetic', 'Expensive', 'Here it means appealing or advantageous.'],
    ],
  },
  {
    title: 'Remote work',
    text: 'Remote work spread quickly during the pandemic and many companies kept it afterwards. Employees often report that skipping long commutes gives them more time and less stress. Companies save on office space. Yet remote work has costs as well. New employees can find it harder to learn from colleagues, and some managers worry that teamwork suffers when people rarely meet. As a result, many firms now follow a hybrid model, asking staff to come to the office on fixed days while allowing work from home on others.',
    qs: [
      ['What benefit for employees is mentioned?', 'More time and less stress from skipping commutes', 'Higher salaries', 'Free laptops', 'Longer holidays', 'The passage mentions time and stress saved by skipping commutes.'],
      ['Who may find remote work especially hard?', 'New employees', 'Senior managers', 'Customers', 'Office landlords', 'New employees find it harder to learn from colleagues.'],
      ['What is the hybrid model?', 'Fixed office days with work from home on other days', 'Working only at night', 'Working from two offices', 'Working without managers', 'The final sentence defines it.'],
      ['Which statement would the author most likely agree with?', 'Remote work has both advantages and drawbacks', 'Remote work should be banned', 'Offices are no longer needed', 'Teamwork never suffers remotely', 'The passage presents benefits and costs.'],
    ],
  },
];

const shape = (r, q, correct, wrong, ex) => mcq(r, { q, correct, wrong, ex });

export function verbalQuestions(seed = 'verbal') {
  const r = rng(seed);
  const topics = {
    synonyms: [...SYN, ...SYN2].map(([w, c, ...wr]) => shape(r, `Choose the word closest in meaning to "${w}".`, c, wr, `"${w}" means ${c.toLowerCase()}.`)),
    antonyms: [...ANT, ...ANT2].map(([w, c, ...wr]) => shape(r, `Choose the word opposite in meaning to "${w}".`, c, wr, `The opposite of "${w}" is "${c}"; the other options are similar in meaning or unrelated.`)),
    'fill-in-the-blanks': [...FILL, ...FILL2].map(([s, c, a, b, d, ex]) => shape(r, `Fill in the blank: ${s}`, c, [a, b, d], ex)),
    'error-spotting': [...ERR, ...ERR2].map(([A, B, C, ans, ex]) => mcq(r, { q: `Find the part of the sentence that has an error.\n(A) ${A} (B) ${B} (C) ${C}`, correct: ans === 'No error' ? 'No error' : `(${ans}) ${({ A, B, C })[ans]}`, wrong: ['A', 'B', 'C', 'No error'].filter((x) => x !== ans).map((x) => (x === 'No error' ? x : `(${x}) ${({ A, B, C })[x]}`)), ex })).map((q) => ({ ...q, options: sortErr(q.options), a: sortErr(q.options).indexOf(q.options[q.a]) })),
    idioms: [...IDIOMS, ...IDIOMS2].map(([i, m, ...wr]) => shape(r, `What does the idiom "${i}" mean?`, m, wr, `"${i}" means: ${m.toLowerCase()}.`)),
    'para-jumbles': [...JUMBLES, ...J2].map(([sent, order, ex]) => {
      const others = shuffle(r, ['PQRS', 'QPRS', 'SQPR', 'QRSP', 'PSQR', 'QSPR', 'QPSR', 'RQPS', 'SPQR'].filter((o) => o !== order));
      return mcq(r, { q: `Arrange the sentences in a logical order:\n${Object.entries(sent).map(([k, v]) => `${k}. ${v}`).join('\n')}`, correct: order, wrong: others, ex });
    }),
    'one-word-substitution': ONE_WORD.map(([d, w, ...wr]) => shape(r, `Choose the one word for: "${d}".`, w, wr, `"${w}" means: ${d.toLowerCase()}.`)),
    spelling: [...SPELL, ...SPELL2].map(([w, ...wr]) => shape(r, 'Choose the correctly spelt word.', w, wr, `The correct spelling is "${w}".`)),
    'sentence-correction': [...SENTENCE, ...SENTENCE2].map(([c, a, b, d, ex]) => shape(r, 'Choose the grammatically correct sentence.', c, [a, b, d], ex)),
    'reading-comprehension': [...RC, ...RC2].flatMap((p) => p.qs.map(([q, c, a, b, d, ex]) => ({ ...shape(r, q, c, [a, b, d], ex), passage: { title: p.title, text: p.text } }))),
  };
  return topics;
}
const ERR_ORDER = (o) => (o.startsWith('(A)') ? 0 : o.startsWith('(B)') ? 1 : o.startsWith('(C)') ? 2 : 3);
function sortErr(opts) {
  return [...opts].sort((a, b) => ERR_ORDER(a) - ERR_ORDER(b));
}

export const VERBAL_TOPICS = [
  ['synonyms', 'Synonyms', 'Words with similar meanings.'],
  ['antonyms', 'Antonyms', 'Words with opposite meanings.'],
  ['fill-in-the-blanks', 'Fill in the Blanks', 'Prepositions, tenses, articles and agreement.'],
  ['error-spotting', 'Error Spotting', 'Find the part of the sentence with a grammar error.'],
  ['idioms', 'Idioms and Phrases', 'Common idioms used in tests.'],
  ['one-word-substitution', 'One-Word Substitution', 'Replace a phrase with a single word.'],
  ['spelling', 'Spelling', 'Pick the correctly spelt word.'],
  ['sentence-correction', 'Sentence Correction', 'Agreement, tenses, conditionals, voice and punctuation.'],
  ['para-jumbles', 'Para Jumbles', 'Arrange sentences into a logical paragraph.'],
  ['reading-comprehension', 'Reading Comprehension', 'Short passages with questions.'],
];

/**
 * Third batch of verbal items (hand-written, original), so every verbal topic has at least 50.
 *   FILL2:    [sentence with ___, correct, wrong x3, explanation]
 *   ERR2:     [part A, part B, part C, 'A'|'B'|'C'|'No error', explanation]
 *   SPELL2:   [correct, misspelling x3]
 *   SENTENCE2:[correct sentence, wrong x3, explanation]
 *   JUMBLES2: [correct order, 1st sentence, 2nd, 3rd, 4th, hint]  (sentences are labelled by the order)
 *   RC2:      { title, text, qs: [[question, correct, wrong x3, explanation]] }
 */
export const FILL2 = [
  ['The meeting has been put ___ until next week.', 'off', 'up', 'on', 'in', '"Put off" means postpone.'],
  ['She is afraid ___ dogs.', 'of', 'from', 'with', 'by', 'We say "afraid of".'],
  ['He was accused ___ stealing the files.', 'of', 'for', 'with', 'about', 'The pattern is "accused of".'],
  ['The train will arrive ___ platform 3.', 'at', 'in', 'on', 'into', 'Use "at" for a specific point such as a platform or station.'],
  ['Neither of the answers ___ correct.', 'is', 'are', 'were', 'have been', '"Neither of" takes a singular verb in formal English.'],
  ['By next June, she ___ here for ten years.', 'will have worked', 'will work', 'has worked', 'is working', 'A time up to a future point needs the future perfect.'],
  ['I wish I ___ more time to prepare.', 'had', 'have', 'will have', 'am having', 'Wishes about the present use the past form.'],
  ['He apologised ___ being late.', 'for', 'of', 'about', 'to', 'We apologise to a person for something.'],
  ['This is the best book I have ___ read.', 'ever', 'never', 'yet', 'already', '"The best … I have ever …" is the usual pattern.'],
  ['The students were divided ___ four groups.', 'into', 'in', 'among', 'between', '"Divide into" groups or parts.'],
  ['Let us wait ___ the rain stops.', 'until', 'unless', 'since', 'while', '"Until" marks the point at which the waiting ends.'],
];

export const ERR2 = [
  ['Neither the manager', 'nor his assistants', 'was informed.', 'C', 'With "neither ... nor", the verb agrees with the nearer subject, "assistants": "were informed".'],
  ['She has been working', 'here since', 'five years.', 'C', 'Use "for" with a length of time: "for five years". "Since" goes with a point in time.'],
  ['Each of the players', 'has been given', 'a new jersey.', 'No error', '"Each" is singular, so "has been given" is correct.'],
  ['The teacher as well as', 'the students', 'were present.', 'C', 'With "as well as", the verb follows the first subject: "was present".'],
  ['He did not knew', 'the answer to', 'the last question.', 'A', 'After "did not" use the base form: "did not know".'],
  ['One of my friend', 'is going', 'to Canada next month.', 'A', '"One of" takes a plural noun: "one of my friends".'],
  ['She has been living', 'in Pune', 'since five years.', 'C', 'For a period of time use "for": "for five years".'],
  ['I am looking forward', 'to see you', 'at the event.', 'B', '"Look forward to" takes the -ing form: "to seeing you".'],
  ['The price of vegetables', 'have gone up', 'this month.', 'B', 'The subject is "price" (singular): "has gone up".'],
  ['He is senior', 'than me', 'in the office.', 'B', '"Senior" takes "to": "senior to me".'],
  ['If I will get', 'the job,', 'I will move to Hyderabad.', 'A', 'The "if" clause of a first conditional uses the present: "If I get".'],
  ['The scenery', 'of Kashmir', 'are beautiful.', 'C', '"Scenery" is uncountable: "is beautiful".'],
  ['She returned', 'the book', 'to the library yesterday.', 'No error', 'The sentence is correct.'],
  ['She speaks English', 'very good', 'for a beginner.', 'B', 'An adverb describes a verb: "speaks very well".'],
  ['We discussed about', 'the project', 'for two hours.', 'A', '"Discuss" takes no preposition: "We discussed the project".'],
  ['Neither Ravi', 'nor his friends', 'was invited.', 'C', 'With "neither…nor" the verb follows the nearer subject, "friends": "were invited".'],
  ['The furniture', 'in the hall', 'are very old.', 'C', '"Furniture" is uncountable: "is very old".'],
  ['He returned back', 'to his hometown', 'after the exams.', 'A', '"Return" already means go back; "returned back" is redundant.'],
  ['My brother is', 'elder than', 'me by two years.', 'B', 'Use "older than"; "elder" is not used with "than".'],
  ['Hardly had I sat down', 'than the', 'phone rang.', 'B', '"Hardly" pairs with "when", not "than".'],
  ['They had finished', 'the work', 'before the deadline.', 'No error', 'The sentence is correct: the past perfect shows the earlier action.'],
  ['He gave me', 'an advice', 'about my career.', 'B', '"Advice" is uncountable: "some advice" or "a piece of advice".'],
  ['Unless you do not hurry,', 'you will', 'miss the bus.', 'A', '"Unless" already means "if not": "Unless you hurry".'],
  ['The committee', 'have submitted', 'its report.', 'B', 'With "its", the committee is one body: "has submitted".'],
  ['She is one of', 'those people who', 'never complains.', 'C', '"Who" refers to "people" (plural): "never complain".'],
  ['I have seen', 'that film', 'last week.', 'A', 'A finished past time ("last week") needs the simple past: "I saw".'],
  ['The police', 'has arrested', 'two suspects.', 'B', '"Police" is plural: "have arrested".'],
  ['Mathematics', 'are my favourite', 'subject.', 'B', 'Subjects ending in -ics are singular: "is my favourite".'],
];

export const SPELL2 = [
  ['Embarrassment', 'Embarassment', 'Embarrasment', 'Emberrassment'], ['Independent', 'Independant', 'Indipendent', 'Independint'],
  ['Occasionally', 'Ocasionally', 'Occassionally', 'Occasionaly'], ['Environment', 'Enviroment', 'Envirnment', 'Environmant'],
  ['Government', 'Goverment', 'Govenment', 'Governmant'], ['Beginning', 'Begining', 'Beggining', 'Beginnig'],
  ['Knowledge', 'Knowlege', 'Knowledg', 'Knoweldge'], ['Successful', 'Succesful', 'Successfull', 'Sucessful'],
  ['Disappoint', 'Dissapoint', 'Disapoint', 'Dissappoint'], ['Calendar', 'Calender', 'Calandar', 'Calander'],
  ['Foreign', 'Foriegn', 'Foreighn', 'Forein'], ['Immediately', 'Immediatly', 'Imediately', 'Immediatelly'],
];

export const SENTENCE2 = [
  ['Who is taller, Ravi or Sameer?', 'Who is tallest, Ravi or Sameer?', 'Who is more taller, Ravi or Sameer?', 'Who taller is, Ravi or Sameer?', 'Comparing two people uses the comparative "taller".'],
  ['She has lived here for five years.', 'She is living here for five years.', 'She lives here since five years.', 'She has lived here since five years.', 'A period of time with the present perfect uses "for".'],
  ['I did not go anywhere yesterday.', 'I did not go nowhere yesterday.', 'I did not went anywhere yesterday.', 'I not went anywhere yesterday.', 'Avoid double negatives; use the base verb after "did not".'],
  ['The manager asked me where I lived.', 'The manager asked me where did I live.', 'The manager asked me where do I live.', 'The manager asked me where I live?', 'Reported questions use statement word order and no question mark.'],
  ['Let him go home.', 'Let him to go home.', 'Let him goes home.', 'Let him going home.', '"Let" is followed by the base verb without "to".'],
  ['He is the person whom I met in Delhi.', 'He is the person which I met in Delhi.', 'He is the person whose I met in Delhi.', 'He is the person what I met in Delhi.', '"Whom" is the object pronoun for people.'],
  ['The work was completed by the team.', 'The work was complete by the team.', 'The work completed by the team was.', 'The work were completed by the team.', 'Passive voice: "was" + past participle "completed".'],
  ['I have been waiting for an hour.', 'I am waiting since an hour.', 'I have been waiting since an hour.', 'I waited from an hour.', 'An action continuing up to now: present perfect continuous with "for".'],
  ['She suggested that we take a break.', 'She suggested us to take a break.', 'She suggested to take us a break.', 'She suggested we taking a break.', '"Suggest" is followed by a that-clause (or an -ing form), not "someone to".'],
  ['Hardly anyone came to the meeting.', 'Hardly no one came to the meeting.', 'Hardly anyone did not come to the meeting.', 'Hardly anyone come to the meeting.', '"Hardly" is already negative; do not add another negative.'],
  ['The report, which was due on Monday, is late.', 'The report which was due on Monday, is late.', 'The report, which was due on Monday is late.', 'The report, that was due on Monday, is late.', 'A non-defining clause needs commas on both sides and uses "which".'],
  ['Either you or he has to attend.', 'Either you or he have to attend.', 'Either you nor he has to attend.', 'Either you or him has to attend.', 'With "either…or" the verb agrees with the nearer subject "he".'],
  ['It is high time we left.', 'It is high time we leave.', 'It is high time we will leave.', 'It is high time we are leaving.', '"It is high time" is followed by the past form.'],
  ['He has two brothers-in-law.', 'He has two brother-in-laws.', 'He has two brothers-in-laws.', 'He has two brother-in-law.', 'The plural goes on the main noun: "brothers-in-law".'],
  ['The children are playing in the park.', 'The childrens are playing in the park.', 'The children is playing in the park.', 'The childs are playing in the park.', '"Children" is already plural.'],
];

export const JUMBLES2 = [
  ['QSPR', 'Arjun wanted to learn coding but had no laptop.', 'He began practising on the computers at the public library.', 'Within a year he had built his first mobile app.', 'Today he teaches coding to other students in his area.', 'Problem → workaround → result → giving back.'],
  ['RPSQ', 'The monsoon reached Kerala in the first week of June.', 'Over the next few weeks it moved steadily north.', 'By early July it had covered almost the whole country.', 'Farmers then began sowing their kharif crops.', 'Arrival → spread → full coverage → effect.'],
  ['SQRP', 'Priya applied for an internship at a software company.', 'She was called for an online test the following week.', 'After clearing it, she faced two rounds of interviews.', 'A week later she received the offer letter.', 'Application → test → interviews → offer.'],
  ['PRQS', 'Making tea is simple.', 'First, boil water with a little ginger.', 'Then add tea leaves, milk and sugar.', 'Finally, strain it into a cup and serve.', 'Topic sentence → first → then → finally.'],
  ['QPSR', 'A fire broke out in the market late at night.', 'A watchman saw the smoke and called the fire brigade.', 'The firefighters reached within ten minutes.', 'They put out the fire before it could spread.', 'Event → alert → arrival → result.'],
  ['RSPQ', 'Plastic waste is a growing problem in Indian cities.', 'Much of it ends up in drains and blocks them.', 'This causes flooding during heavy rain.', 'Many cities have therefore banned single-use plastic.', 'Problem → consequence → further consequence → response.'],
  ['SPRQ', 'Mohan opened a small shop selling mobile accessories.', 'At first, very few customers came in.', 'He then started selling online as well.', 'His sales doubled within six months.', 'Start → difficulty → change → outcome.'],
  ['PSQR', 'The students reached the hill station by bus.', 'After checking into the hostel, they rested for an hour.', 'In the evening, they walked to the view point.', 'They watched the sunset before returning for dinner.', 'Arrival → rest → evening walk → end of day.'],
  ['RQSP', 'Ancient Indians made great progress in mathematics.', 'They developed the decimal place-value system.', 'They also used zero as a number.', 'These ideas later spread to the rest of the world.', 'General claim → example → second example → impact.'],
  ['QRPS', 'Sleep is essential for good health.', 'During sleep, the body repairs itself.', 'The brain also stores what we learned during the day.', 'So students who sleep well often remember more.', 'Claim → reason → second reason → conclusion.'],
  ['QSPR', 'The company launched a new phone in March.', 'Early reviews praised its battery life.', 'Sales crossed one million units in a month.', 'A cheaper version was announced soon after.', 'Launch → reviews → sales → follow-up.'],
  ['RPSQ', 'Ravi missed the last bus home.', 'He tried to book a cab, but none were available.', 'He finally called his elder brother.', 'His brother came on his bike and picked him up.', 'Problem → failed attempt → new attempt → solution.'],
  ['SQRP', 'Bees play a key role in farming.', 'They carry pollen from one flower to another.', 'This helps plants produce fruits and seeds.', 'Without bees, many crops would fail.', 'Claim → how → result → what if not.'],
  ['PRQS', 'Our college organised a blood donation camp.', 'Volunteers put up posters a week before.', 'On the day, over two hundred students donated blood.', 'The blood bank thanked the college in a letter.', 'Event named → preparation → the day → afterwards.'],
  ['QPSR', 'Water boils at 100 °C at sea level.', 'At higher altitudes, the air pressure is lower.', 'So water boils at a lower temperature there.', 'This is why cooking takes longer in the mountains.', 'Fact → condition → effect → practical result.'],
  ['RSPQ', 'Meena wanted to improve her spoken English.', 'She started watching English news every evening.', 'She also joined a weekend speaking club.', 'Within months she spoke confidently in interviews.', 'Goal → step → second step → result.'],
  ['SPRQ', 'Digital payments have grown rapidly in India.', 'Even small vendors now accept UPI.', 'People no longer need to carry much cash.', 'However, they must stay alert to online fraud.', 'Trend → example → benefit → caution.'],
  ['PSQR', 'The old bridge had developed cracks.', 'Engineers inspected it and declared it unsafe.', 'It was closed to traffic the next day.', 'A new bridge was completed two years later.', 'Problem → inspection → action → outcome.'],
  ['RQSP', 'Kabir planned to run a marathon.', 'He started by jogging two kilometres a day.', 'Slowly, he increased the distance every week.', 'Six months later, he finished the race.', 'Goal → beginning → progress → achievement.'],
  ['QRPS', 'A good resume is short and clear.', 'It should list your skills and projects first.', 'Next come your education and achievements.', 'Finally, check it carefully for spelling errors.', 'Main idea → first → next → finally.'],
  ['QSPR', 'Sara forgot her umbrella at home.', 'On the way to college, it began to rain heavily.', 'She took shelter at a bus stop.', 'A friend passing by shared his umbrella with her.', 'Setup → problem → reaction → help.'],
  ['RPSQ', 'Trees help keep cities cool.', 'Their leaves give shade to roads and buildings.', 'They also release water vapour into the air.', 'Planting more trees can therefore lower city temperatures.', 'Claim → first reason → second reason → conclusion.'],
  ['SQRP', 'The exam results were announced on Friday.', 'Students crowded around the notice board.', 'Anil searched anxiously for his roll number.', 'He smiled when he saw he had passed with distinction.', 'Event → crowd → search → result.'],
  ['PRQS', 'Saving money early is a wise habit.', 'Even a small amount saved each month grows over time.', 'This is because interest is earned on earlier interest.', 'Students should start saving as soon as they earn.', 'Claim → how → why → advice.'],
  ['QPSR', 'The village had no proper road.', 'Children walked five kilometres through fields to school.', 'In 2022 the government built a paved road.', 'Now a school bus picks them up every morning.', 'Situation → hardship → change → present.'],
  ['RSPQ', 'Lakshmi\'s grandmother taught her to cook.', 'They started with simple dishes like rice and dal.', 'Later they moved on to biryani and sweets.', 'Today Lakshmi runs a popular food stall.', 'Teacher → start → progress → today.'],
  ['SPRQ', 'Electric scooters are becoming popular.', 'They are cheaper to run than petrol scooters.', 'They also produce no exhaust smoke.', 'Charging stations, however, are still few.', 'Trend → benefit → second benefit → drawback.'],
  ['PSQR', 'The power went out during the cricket final.', 'Fans in the hostel groaned in disappointment.', 'Someone quickly started the match on a phone.', 'Everyone gathered around the small screen to watch.', 'Event → reaction → fix → result.'],
  ['RQSP', 'Reading newspapers helps in placement tests.', 'It improves vocabulary and reading speed.', 'It also keeps you updated on current affairs.', 'Both are tested in many company exams.', 'Claim → benefit → second benefit → link to tests.'],
  ['QRPS', 'A startup begins with an idea.', 'The founders then build a basic version of the product.', 'They test it with real users and collect feedback.', 'Using that feedback, they improve the product.', 'Start → build → test → improve.'],
  ['QSPR', 'Ali lost his wallet on the train.', 'He reported it to the railway police.', 'Two days later, the police called him.', 'A passenger had found the wallet and handed it in.', 'Loss → report → call → explanation.'],
  ['RPSQ', 'The Indian Space Research Organisation launched a lunar mission.', 'The spacecraft travelled for over a month.', 'It then landed softly near the Moon\'s south pole.', 'The landing made headlines around the world.', 'Launch → journey → landing → reaction.'],
  ['SQRP', 'Interviews can make candidates nervous.', 'Preparing common answers in advance helps a lot.', 'Practising with friends builds confidence further.', 'On the day, arriving early also keeps stress low.', 'Problem → tip → further tip → final tip.'],
  ['PRQS', 'The library introduced a new rule.', 'Books could now be borrowed for three weeks instead of two.', 'Students welcomed the change during exams.', 'As a result, borrowing went up by forty per cent.', 'Rule → detail → response → result.'],
  ['QPSR', 'Rekha found a stray puppy outside her house.', 'It was shivering and looked hungry.', 'She gave it milk and a warm blanket.', 'The next morning, she took it to a vet.', 'Discovery → condition → care → next step.'],
  ['RSPQ', 'Our team entered a national hackathon.', 'We worked for thirty-six hours without much sleep.', 'Our app helped farmers check crop prices.', 'It won second prize among two hundred teams.', 'Entry → effort → product → result.'],
  ['SPRQ', 'Learning a new language takes patience.', 'Beginners should first learn common words.', 'Then they can form simple sentences.', 'With regular practice, fluency slowly follows.', 'Claim → first → then → result.'],
  ['PSQR', 'The chef tasted the soup.', 'It was too salty.', 'He added some boiled potatoes to absorb the salt.', 'After ten minutes, the soup tasted just right.', 'Action → problem → fix → result.'],
  ['RQSP', 'Online classes became common during the pandemic.', 'Teachers had to learn new tools quickly.', 'Many students struggled with poor internet.', 'Even so, most colleges managed to finish the syllabus.', 'Situation → challenge → second challenge → outcome.'],
  ['QRPS', 'Hyderabad is known for its biryani.', 'The dish was developed in the kitchens of the Nizams.', 'Over time it spread to homes and restaurants.', 'Today visitors from all over the world come to taste it.', 'Fame → origin → spread → present.'],
];

export const RC2 = [
  {
    title: 'Learning from mistakes',
    text: 'Many students fear making mistakes, especially in mock tests. Yet researchers who study learning have found that mistakes, when reviewed carefully, help memory more than easy successes. When a student gets a question wrong and then studies the correct method, the brain links the new idea to the earlier confusion, which makes it easier to recall later. The key is reviewing errors soon after the test, not just checking the final score. Students who keep a short notebook of their mistakes often improve faster than those who only attempt more and more questions.',
    qs: [
      ['What is the main idea of the passage?', 'Reviewing mistakes helps students learn better', 'Students should avoid mock tests', 'Final scores are the only thing that matters', 'Attempting more questions is always best', 'The passage argues that carefully reviewed mistakes improve learning.'],
      ['According to the passage, when should errors be reviewed?', 'Soon after the test', 'Only before the final exam', 'Once a year', 'Never', 'It says the key is reviewing errors soon after the test.'],
      ['What habit does the passage recommend?', 'Keeping a short notebook of mistakes', 'Skipping difficult questions', 'Studying only easy topics', 'Taking tests without timing', 'Students who keep a mistakes notebook improve faster.'],
      ['The word "recall" in the passage most nearly means:', 'Remember', 'Cancel', 'Telephone', 'Repeat aloud', '"Recall" here means to bring back to memory.'],
    ],
  },
  {
    title: 'Millets',
    text: 'Millets such as jowar, bajra and ragi were once everyday food across India. Over the last fifty years, rice and wheat replaced them on most plates. Now millets are returning. They need far less water than rice and can grow on poor soil, which makes them suitable for dry regions. They are also rich in fibre and minerals. The United Nations declared 2023 the International Year of Millets, and many Indian cities now have restaurants and packaged foods that use them. Farmers, however, say they need better prices before they will grow more.',
    qs: [
      ['Why are millets suitable for dry regions?', 'They need little water and grow on poor soil', 'They need a lot of fertiliser', 'They grow only in cold places', 'They are easy to export', 'The passage says they need far less water and can grow on poor soil.'],
      ['What replaced millets on most plates?', 'Rice and wheat', 'Maize and barley', 'Pulses', 'Packaged snacks', 'It states that rice and wheat replaced them.'],
      ['What do farmers want before growing more millets?', 'Better prices', 'More rain', 'New machines', 'Fewer restaurants', 'Farmers say they need better prices.'],
      ['Which statement is supported by the passage?', 'Millets are making a comeback', 'Millets were never eaten in India', 'Millets need more water than rice', 'The UN banned millets', 'The passage says "Now millets are returning".'],
    ],
  },
  {
    title: 'Remote work',
    text: 'After 2020, many IT companies allowed employees to work from home. Employees saved hours of travel and many said they could focus better. Companies saved on office costs. But problems appeared too. New joiners found it hard to learn without seniors nearby, and some teams felt less connected. By 2024, most large firms had moved to a hybrid model, asking staff to come to the office two or three days a week. Supporters say this mix keeps the benefits of both while reducing the drawbacks.',
    qs: [
      ['What problem did new joiners face while working from home?', 'Learning without seniors nearby', 'Too much travel', 'High office costs', 'Too many meetings in person', 'The passage says new joiners found it hard to learn without seniors nearby.'],
      ['What is a hybrid model, as described here?', 'Working from the office on some days and from home on others', 'Working only from home', 'Working only night shifts', 'Working for two companies', 'Staff come to the office two or three days a week.'],
      ['Which was a benefit for employees?', 'Saving hours of travel', 'Higher office costs', 'Fewer holidays', 'Longer commutes', 'Employees saved hours of travel.'],
      ['The tone of the passage is best described as:', 'Balanced', 'Angry', 'Humorous', 'Sad', 'It presents both benefits and problems.'],
    ],
  },
  {
    title: 'The habit of reading',
    text: 'Surveys show that young people today read more words than ever, but mostly in short messages and posts. Long reading, such as books and detailed articles, has declined. Teachers worry that this affects concentration, because following a long argument trains the mind to stay focused. Some colleges have started reading clubs where students discuss one book a month. Members say the discussions make reading feel social rather than a chore, and many report reading more outside the club as well.',
    qs: [
      ['What kind of reading has declined?', 'Long reading such as books and detailed articles', 'Reading of short messages', 'Reading of posts', 'All reading', 'It says long reading has declined.'],
      ['Why are teachers worried?', 'It may affect concentration', 'Students read too many books', 'Books are too expensive', 'Clubs are too noisy', 'Teachers worry this affects concentration.'],
      ['What do reading club members say?', 'Discussions make reading feel social', 'Reading clubs are boring', 'They read less outside the club', 'They prefer short posts', 'Members say discussions make reading feel social.'],
      ['The word "chore" most nearly means:', 'A boring task', 'A celebration', 'A chorus', 'A reward', 'A chore is a dull routine task.'],
    ],
  },
  {
    title: 'Solar rooftops',
    text: 'More Indian homes are installing solar panels on their rooftops. A typical system costs a family about the price of a used scooter, but government subsidies reduce this. Once installed, the panels can cut electricity bills sharply, and extra power can be sold back to the grid in many states. The main obstacles are the upfront cost and a lack of trusted installers in smaller towns. Experts expect prices to keep falling as more panels are made in India.',
    qs: [
      ['What reduces the cost of a solar system?', 'Government subsidies', 'Selling the scooter', 'Higher electricity bills', 'Imported panels', 'It says government subsidies reduce the cost.'],
      ['What can families do with extra power in many states?', 'Sell it back to the grid', 'Store it forever', 'Give it to neighbours for free only', 'Nothing', 'Extra power can be sold back to the grid.'],
      ['Which is mentioned as an obstacle?', 'Lack of trusted installers in smaller towns', 'Too much sunlight', 'Falling prices', 'Too many subsidies', 'The passage lists upfront cost and a lack of trusted installers.'],
      ['Why do experts expect prices to fall?', 'More panels are being made in India', 'Demand is falling', 'Subsidies are ending', 'Sunlight is increasing', 'Prices should fall as more panels are made in India.'],
    ],
  },
  {
    title: 'First job',
    text: 'Starting a first job is exciting but also confusing. Many freshers expect to write code from day one, but the first weeks are often spent in training and learning the company\'s tools. Managers say the freshers who do best are not always those with the highest marks. They are the ones who ask questions, take notes and finish small tasks on time. Communication matters too: a short, clear update to a team lead is often valued more than a long, late report.',
    qs: [
      ['How are the first weeks of a job often spent?', 'In training and learning the company\'s tools', 'Writing code for clients from day one', 'On holiday', 'Interviewing other candidates', 'The passage says the first weeks are often spent in training.'],
      ['According to managers, which freshers do best?', 'Those who ask questions and finish small tasks on time', 'Only those with the highest marks', 'Those who work alone silently', 'Those who write long reports', 'Managers name asking questions, taking notes and finishing tasks on time.'],
      ['What kind of update is valued more?', 'A short, clear update', 'A long, late report', 'No update at all', 'An update sent once a month', 'A short clear update is valued more than a long late report.'],
      ['What is the passage mainly about?', 'Habits that help freshers succeed in a first job', 'How to get high marks', 'Why training is useless', 'How to write long reports', 'It describes what helps freshers do well.'],
    ],
  },
  {
    title: 'Street food safety',
    text: 'Street food is a big part of Indian city life, from pani puri to dosa. It is cheap, quick and often delicious. But food safety officers say that unclean water and uncovered food can spread illness, especially in the monsoon. Some cities now train vendors in hygiene and give certificates to those who follow simple rules, such as using filtered water, wearing gloves and covering food. Customers can help by choosing busy stalls, where food is freshly made and sold quickly.',
    qs: [
      ['When is the risk of illness from street food described as higher?', 'In the monsoon', 'In winter', 'At midnight', 'During festivals only', 'The passage says especially in the monsoon.'],
      ['Which is one of the hygiene rules mentioned?', 'Using filtered water', 'Selling food only at night', 'Raising prices', 'Using plastic plates only', 'Filtered water, gloves and covering food are listed.'],
      ['Why does the passage suggest choosing busy stalls?', 'Food there is freshly made and sold quickly', 'They are cheaper', 'They have certificates for sure', 'They are quieter', 'Busy stalls sell freshly made food quickly.'],
      ['The passage\'s attitude towards street food is:', 'Positive but cautious', 'Completely negative', 'Indifferent', 'Mocking', 'It praises street food while warning about safety.'],
    ],
  },
  {
    title: 'Group discussions',
    text: 'Many companies use group discussions to choose candidates. A group of eight to ten people is given a topic and about fifteen minutes to discuss it. Evaluators are not looking for the loudest speaker. They watch whether a candidate makes relevant points, listens to others and helps the group move forward. Starting the discussion can earn credit, but only if the opening is clear. Summarising the discussion at the end is another way to stand out.',
    qs: [
      ['What are evaluators looking for?', 'Relevant points, listening and helping the group move forward', 'The loudest speaker', 'The person who speaks the longest', 'Someone who agrees with everyone', 'The passage lists relevant points, listening and moving the group forward.'],
      ['When does starting the discussion earn credit?', 'Only if the opening is clear', 'Always', 'Never', 'Only if it is long', 'It earns credit only if the opening is clear.'],
      ['How long is a typical discussion, according to the passage?', 'About fifteen minutes', 'An hour', 'Five minutes', 'Two hours', 'About fifteen minutes is given.'],
      ['Which is another way to stand out?', 'Summarising the discussion at the end', 'Interrupting often', 'Staying silent', 'Changing the topic', 'Summarising at the end is mentioned.'],
    ],
  },
];

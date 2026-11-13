/**
 * Turns a short explanation into a full one: how to solve (method), the worked steps, and a shortcut.
 * Rules are matched on the question text, most specific first; every topic also has a default.
 * The output is a plain string with one part per line:
 *   "How to solve: …\nStep: …\nStep: …\nShortcut: …"
 * The site renders "How to solve" as a lead line, "Step" lines as a numbered list and "Shortcut" in a box.
 */

/** Rules for code questions: a general tracing method plus the specific trap the code contains. */
function CODE(lang) {
  const trace = `Trace the ${lang} code line by line, keeping a small table of every variable's value, and print exactly what each output statement prints.`;
  return [
    [/\w\+\+|\+\+\w|\w--|--\w/, trace, 'i++ uses the old value and then adds 1; ++i adds 1 first. In a loop condition or a print, that one-step difference changes the output.'],
    [/static/, trace, 'A static variable is created once and keeps its value between calls (and across recursive calls), unlike a normal local variable.'],
    [/sizeof/, trace, 'sizeof is worked out at compile time: char is 1 byte, int usually 4, and an array gives its total size in bytes.'],
    [/==.*(String|"\w)|equals\(/, trace, 'In Java, == compares references and equals() compares contents. String literals are pooled, so "a" == "a" is true, but new String("a") == "a" is false.'],
    [/finally/, trace, 'finally always runs, even after return; if finally itself returns, that value replaces the earlier one.'],
    [/\/\/|\b\d+\s*\/\s*\d+\b|%/, trace, 'Integer division drops the fraction (7 / 2 = 3 in C/Java; use 7 // 2 in Python), and % gives the remainder.'],
    [/\[.*:.*\]/, trace, 'Python slices a[start:stop:step] stop before the stop index; a negative step walks backwards, so a[::-1] reverses.'],
    [/def |lambda|append|extend/, trace, 'Lists are mutable and shared by reference: changing a list inside a function (or through another name) changes the original.'],
    [/virtual|override|extends|super/, trace, 'With overriding, the method that runs is chosen by the actual object type at run time, not by the reference type.'],
    [/for|while|do/, trace, 'Count the loop iterations carefully: check the starting value, the condition and the update; off-by-one errors are the usual trap.'],
    [/.*/, trace, ''],
  ];
}

// [regex on the question, method, shortcut]. Shortcut may be '' when there is no real trick.
const R = {
  percentages: [
    [/^What is \d+% of/, 'x% of N means (x ÷ 100) × N.', 'Split the percent into easy pieces: 10% is N ÷ 10, 5% is half of that, 1% is N ÷ 100. For example 35% = 10% + 10% + 10% + 5%.'],
    [/increased by \d+% becomes/, 'If a number grows by p%, the new value = number × (1 + p/100). Divide the new value by that factor to get back the original.', 'A 25% increase means × 5/4, so divide by 5 and multiply by 4. Turn the percent into a fraction (20% = 1/5, 25% = 1/4, 50% = 1/2) and work with fractions.'],
    [/first increased by \d+% and then decreased/, 'Successive changes multiply: (1 + a/100) × (1 − b/100). The net percent change is a − b − ab/100.', 'Net change for +a% then −b% = a − b − (a × b)/100. Same numbers up then down (e.g. +20%, −20%) always give a loss of a²/100 %.'],
    [/needs \d+% of the total marks/, 'Pass marks = marks scored + marks short. Pass marks are p% of the total, so total = pass marks × 100 ÷ p.', 'Find pass marks first (scored + short), then divide by the percent and multiply by 100.'],
    [/more than B's\. By what percent is B's income less/, 'If A is r% more than B, then B is r/(100 + r) × 100 % less than A, because the base changes from B to A.', 'Use r/(100 + r) × 100. For 25% more: 25/125 = 20% less; for 50% more: 50/150 = 33⅓% less.'],
    [/population of a town .* grows by/, 'Growth every year multiplies the population by (1 + r/100) each year.', 'For 2 years at r%, the total growth is 2r + r²/100 percent (like compound interest). At 10%: 20 + 1 = 21%.'],
    [/is equal to \d+% of which number/, 'Write the equation: x% of A = y% of N, then solve N = (x × A) ÷ y.', 'Skip computing x% of A: N = A × x ÷ y directly.'],
    [/rises by \d+%\. By how much percent must a family cut/, 'To keep spending the same, consumption must fall by the same fraction that the price grew, measured against the new price: r/(100 + r) × 100 %.', 'Cut % = r/(100 + r) × 100. Price up 25% → cut 20%; up 20% → cut 16⅔%.'],
    [/spends \d+% of his salary on rent and \d+% of the rest/, 'Each spending is taken from what remains, so savings = salary × (1 − a/100) × (1 − b/100). Work backwards from savings.', 'Multiply the "remaining" fractions (e.g. 0.8 × 0.75 = 0.6) and divide the savings by that one number.'],
    [/election between two candidates/, 'With two candidates, the winner has p% and the loser (100 − p)%. The winning margin is (2p − 100)% of the valid votes.', 'Total votes = margin × 100 ÷ (2p − 100). At 60%, the margin is 20% of the votes, so total = margin × 5.'],
    [/salary is \d+% of B's salary, and B's salary is \d+% of C's/, 'Chain the percents by multiplying them as fractions: A = (p/100) × (q/100) × C.', 'Multiply the two percents and divide by 100: p × q ÷ 100.'],
    [/students, \d+% are boys/, 'Find how many boys and girls there are, then how many of each passed, add them and divide by the total.', 'The overall pass % is the weighted average of the two pass percents, weighted by the share of boys and girls.'],
    [/.*/, 'Turn every percent into a fraction of the right base, write what you know as an equation and solve it step by step.', 'Percent → fraction: 10% = 1/10, 12.5% = 1/8, 20% = 1/5, 25% = 1/4, 33⅓% = 1/3, 50% = 1/2. Fractions make the arithmetic quick.'],
  ],
  'profit-loss': [
    [/successive discounts/, 'Successive discounts multiply on the price that remains: (1 − d1/100)(1 − d2/100). The single equivalent discount is 1 minus that.', 'Equivalent discount = d1 + d2 − d1 × d2 ÷ 100. For 10% and 25%: 35 − 2.5 = 32.5%.'],
    [/cost price of \d+ \w+ equals the selling price of \d+/, 'Assume each item costs ₹1. Compare what b items cost with what they sell for.', 'Profit% = (a − b) ÷ b × 100, where a items cost the same as b items sell for.'],
    [/sold for .* causes a loss|Selling a watch/, 'Cost price = selling price ÷ (1 − loss%/100). Then the new selling price = cost × (1 + gain%/100).', 'Go straight from one selling price to the other: new SP = old SP × (100 + gain) ÷ (100 − loss).'],
    [/weight of \d+ g instead of 1 kg/, 'He charges for 1000 g but gives less. Gain = goods kept ÷ goods given × 100 = (1000 − w) ÷ w × 100.', 'Gain% = (true − false) ÷ false × 100. Always divide by the false weight, not by 1000.'],
    [/cost price of \d+ articles equals the selling price of \d+/, 'Assume each article costs ₹1. Compare what b articles cost with what they sell for.', 'Profit% = (a − b) ÷ b × 100, where a articles cost the same as b articles sell for.'],
    [/profit even after giving a \d+% discount/, 'Take cost = 100. The selling price is 100 + profit%. Marked price = selling price ÷ (1 − discount%/100).', 'Marked price over cost (in %) = (100 + p) × 100 ÷ (100 − d) − 100.'],
    [/marked|discount/i, 'Selling price = marked price × (1 − discount%/100). Profit or loss is then measured on the cost price.', 'Take cost price = 100 to keep the numbers simple, then convert to the real amounts at the end.'],
    [/.*/, 'Profit = selling price − cost price, and profit% = profit ÷ cost price × 100. Losses work the same way. Percentages are always on the cost price unless the question says otherwise.', 'SP = CP × (100 ± p%) ÷ 100, so CP = SP × 100 ÷ (100 ± p%). Taking CP = 100 often makes the working instant.'],
  ],
  'simple-interest': [
    [/doubl/, 'Doubling means the interest equals the principal: P × R × T ÷ 100 = P, so R × T = 100.', 'Rate × time = 100 for doubling, 200 for tripling (interest = 2P), and so on.'],
    [/of the sum\. What is the rate/, 'SI ÷ P is a fraction of the sum; set it equal to R × T ÷ 100 and solve for R.', 'R = (fraction × 100) ÷ T.'],
    [/difference between the simple interest/, 'Interest at each rate uses the same principal and time, so the difference is P × (r1 − r2) × T ÷ 100.', 'Only the rate difference matters: work out the interest at (r1 − r2)% directly.'],
    [/lent in two parts/, 'Let one part be x, the other (total − x). Write the total interest as an equation and solve for x.', 'Alligation: the average rate is (total interest × 100 ÷ total). The two parts are in the ratio of how far each rate is from that average.'],
    [/amounts to .* in \d+ years and to .* in \d+ years/, 'The extra amount over the extra years is pure interest. Find the interest per year, then subtract the interest for the first period from the first amount.', 'Interest per year = difference of amounts ÷ difference of years; principal = first amount − years × that.'],
    [/for \d+ months/, 'Convert months to years (months ÷ 12) and use SI = P × R × T ÷ 100.', 'SI = P × R × months ÷ 1200.'],
    [/for the first \d+ years and at/, 'Work out the interest for each period separately and add them.', 'Total rate-years = r1 × t1 + r2 × t2; interest = P × that ÷ 100.'],
    [/.*/, 'Simple interest = P × R × T ÷ 100, and amount = principal + interest. Rearrange the same formula to find P, R or T.', 'SI on ₹100 for 1 year is just R. Scale up: interest = (P ÷ 100) × R × T.'],
  ],
  'compound-interest': [
    [/becomes ₹[\d,]+ in \d+ years.*(What is the sum|Find the)/, 'Work backwards: principal P = amount ÷ (1 + R/100)^n.', 'At 10% for 2 years divide by 1.21; at 20% divide by 1.44.'],
    [/second year only/, 'Second-year interest is r% of the amount after the first year: P × (1 + r/100) × r/100.', 'Second-year CI = first-year interest + r% of the first-year interest.'],
    [/difference between compound and simple interest .* 2 years/, 'For 2 years, CI − SI = P × (R/100)², the interest earned on the first year\'s interest.', 'P = difference × (100/R)².'],
    [/doubles in \d+ years at compound interest/, 'Each period of that length doubles the money again: after k such periods it is 2^k times.', '4× = 2 periods, 8× = 3 periods, 16× = 4 periods.'],
    [/rate of compound interest per annum does/, 'A ÷ P = (1 + R/100)^n. For 2 years take the square root of A ÷ P.', 'Recognise the square: 1.21 = 1.1² (10%), 1.44 = 1.2² (20%), 1.1025 = 1.05² (5%).'],
    [/compounded quarterly|half-yearly/, 'Divide the yearly rate by the number of periods per year and multiply the number of years by it, then use A = P(1 + r/100)^n.', 'Quarterly: rate ÷ 4, periods × 4. Half-yearly: rate ÷ 2, periods × 2.'],
    [/falls by|loses \d+% of its value|depreciat/i, 'A fall of r% a year multiplies the value by (1 − r/100) each year: V × (1 − r/100)^n.', 'A 10% fall each year leaves 0.9, 0.81, 0.729 of the value after 1, 2, 3 years.'],
    [/rate is \d+% in the first year and \d+% in the second/, 'Apply each year\'s rate in turn: P × (1 + r1/100) × (1 + r2/100). CI is that minus P.', 'Combined rate for two years = r1 + r2 + r1 × r2 ÷ 100 percent.'],
    [/.*/, 'Amount = P × (1 + R/100)^n, and compound interest = amount − P. Each year earns interest on the previous year\'s interest too.', 'For 2 years, CI = 2R + R²/100 percent of P (e.g. 10% → 21%). For 3 years at 10%, the amount is 1.331 × P.'],
  ],
  'ratio-proportion': [
    [/divided (among|between) .* in the ratio/, 'Add the ratio parts to get the total parts. One part = amount ÷ total parts; each share = its parts × one part.', 'Share = amount × (its ratio ÷ sum of ratios).'],
    [/A:B = .* and B:C = .*, what is A:C/, 'Make B the same in both ratios, or simply multiply: A/C = (A/B) × (B/C).', 'A:C = (A-term × second B:C term) : (B-term of A:B × C-term).'],
    [/mean proportional/, 'The mean proportional x satisfies a : x = x : b, so x² = ab and x = √(ab).', 'Look for perfect squares inside a × b.'],
    [/fourth proportional/, 'a : b = c : x means a × x = b × c, so x = (b × c) ÷ a.', 'Fourth proportional = (second × third) ÷ first.'],
    [/coins in the ratio/, 'Find the value of one "set" of coins in the given ratio. Number of sets = total value ÷ value of one set; then multiply by each coin\'s ratio.', 'Convert all coins to rupees first (50p = 0.5, 25p = 0.25).'],
    [/subtracted from each|added to/, 'Write the numbers as ak and bk, form the new ratio as an equation and solve for k.', 'Cross-multiply the new ratio; the k terms collect on one side immediately.'],
    [/.*/, 'Write the quantities as multiples of one unknown (ak, bk), use the given condition to find k, then answer the question.', 'Ratios scale: multiply or divide all terms by the same number. Make the common term equal before combining ratios.'],
  ],
  averages: [
    [/teacher|How old is the (teacher|new)/, 'Old total = count × old average; new total = (count + 1) × new average. The teacher\'s age is the difference.', 'Teacher = new average + old count × (rise in average).'],
    [/boys .* girls|girls .* boys/, 'Combined average = (n1 × a1 + n2 × a2) ÷ (n1 + n2): add the totals, then divide by the total count.', 'The combined average is closer to the larger group\'s average.'],
    [/consecutive odd numbers starting from|consecutive (even|odd)/, 'Consecutive odd (or even) numbers are evenly spaced, so the average is the middle number = (first + last) ÷ 2.', 'Average = first + (n − 1) for n consecutive odd or even numbers.'],
    [/^Find the average of/, 'Add all the numbers and divide by how many there are.', 'Assumed mean: pick a round number near the middle, average the differences from it, and add back. Fewer big additions.'],
    [/first \d+ natural numbers/, 'Sum of 1 to n is n(n + 1)/2, so the average is (n + 1)/2.', 'The average of any evenly spaced list is (first + last) ÷ 2.'],
    [/consecutive even numbers/, 'In an evenly spaced list, the middle number equals the average. Count steps of 2 up to the largest.', 'Largest = average + (n − 1) for consecutive even or odd numbers.'],
    [/innings/, 'New total = (innings + 1) × new average. Runs needed = new total − old total.', 'Runs needed = old average + (innings + 1) × increase.'],
    [/returns at|average speed for the whole journey/, 'Average speed = total distance ÷ total time, not the average of the two speeds.', 'For equal distances, average speed = 2ab ÷ (a + b).'],
    [/sections? .* together|both sections/, 'Combined average = (n1 × a1 + n2 × a2) ÷ (n1 + n2): totals add, then divide by the total count.', 'The combined average lies between the two, closer to the bigger group.'],
    [/new number .* is included|is included/, 'Find the old total (count × average), add the new number, then divide by the new count.', 'New average = old average + (new number − old average) ÷ new count.'],
    [/.*/, 'Average = total ÷ number of items. Work with totals: total = average × count, then add or remove items.', 'When one value changes, the average changes by (change in value) ÷ (number of items).'],
  ],
  ages: [
    [/born \d+ years apart/, 'Write the ages as y, y + k, y + 2k, … and add them; solve for y.', 'The middle child\'s age is the sum ÷ number of children; step down to the youngest.'],
    [/ratio/, 'Write the present ages as ak and bk, add the years to both, set the new ratio and solve for k.', 'The difference between two ages never changes, so compare the change in ratio parts.'],
    [/times as old/, 'Write the ages with one unknown, form an equation from the condition and solve.', 'The age difference stays the same for ever; use it to jump between "now", "then" and "later".'],
    [/average age/, 'Total age = average × number of people. The extra person\'s age = new total − old total.', 'New person = new average + (old count) × (rise in average).'],
    [/.*/, 'Let the unknown age be x, express every other age in terms of x, and turn the sentence into an equation.', 'Age differences are constant; adding n years adds n to every person.'],
  ],
  'time-and-work': [
    [/together finish .* alone takes|alone takes .* How long .* alone/, 'Rate of the other person = joint rate − known rate = 1/together − 1/alone.', 'Other alone = (alone × together) ÷ (alone − together).'],
    [/workers can build|workers can|men can/, 'The work is fixed, so workers × days stays the same (fewer workers, more days).', 'Days2 = workers1 × days1 ÷ workers2.'],
    [/efficient/, 'Efficiency is work per day. If A is k times as efficient as B, A does k units for every 1 unit of B.', 'Together they do (k + 1) units a day, so B alone takes (k + 1) × the joint time.'],
    [/A, B and C can finish a job alone/, 'Each person does 1/(their days) of the job per day. Add the rates and take the reciprocal.', 'Use LCM of the days as total work (units), then divide by the total units per day.'],
    [/A and B together .* B and C .* C and A/, 'Adding the three pair rates counts each person twice: 2(A + B + C) = sum of the pair rates.', 'Take LCM of the three numbers as the work; half the sum of pair rates is the rate of all three.'],
    [/men working \d+ hours a day/, 'Total work in man-hours stays the same: men × days × hours is constant.', 'M1 × D1 × H1 = M2 × D2 × H2; solve for the unknown in one line.'],
    [/paid|share/, 'Payment is shared in the ratio of work done. Working the same days, that is the ratio of daily rates, 1/a : 1/b = b : a.', 'Shares are in the inverse ratio of the days each takes alone.'],
    [/finishes the rest|works for \d+ days and then/, 'Find the fraction already done, the fraction left, and the rate at which the second person finishes it.', 'Use total work = LCM of the days; count units done and units left.'],
    [/.*/, 'Rate = 1 ÷ days. Add rates for people working together; time = work ÷ total rate.', 'Take total work as the LCM of the given days so every rate is a whole number of units per day.'],
  ],
  'pipes-and-cisterns': [
    [/litres per minute while a drain/, 'Net filling rate = inflow − outflow (litres per minute). Time = capacity ÷ net rate.', 'Work in litres, not fractions of the tank.'],
    [/pipe B in \d+ hours\. If both are opened/, 'Add the two rates: 1/a + 1/b of the tank per hour, then take the reciprocal.', 'Two fillers together: time = ab ÷ (a + b).'],
    [/empties|drain|leak/i, 'A filling pipe adds 1/a of the tank per hour; an emptying pipe or leak removes 1/b. Net rate = 1/a − 1/b.', 'Time to fill with one filler and one emptier = ab ÷ (b − a). The leak alone takes ab ÷ (b − a) too.'],
    [/Three pipes/, 'Add the three rates (1/a + 1/b + 1/c) and take the reciprocal.', 'Use LCM of a, b, c as the tank capacity in units.'],
    [/together fill .* One of them alone/, 'Rate of the other pipe = joint rate − known rate = 1/t − 1/a.', 'Other pipe alone = a × t ÷ (a − t).'],
    [/opened for \d+ hours and then A is closed/, 'Find the part filled while both ran, then the time B needs for the rest.', 'Take capacity = LCM of the two times and work in units.'],
    [/litres a minute/, 'Capacity = flow rate × time.', ''],
    [/fraction of the tank/, 'Fraction filled = time × (sum of the rates).', ''],
    [/1\/\d+ of a tank in/, 'If a fraction 1/k fills in m minutes, the whole tank takes k × m minutes.', ''],
    [/.*/, 'Treat pipes like workers: a pipe that fills in a hours does 1/a of the tank each hour. Add fillers, subtract emptiers.', 'Take the tank as LCM of the times (units), so each pipe fills a whole number of units per hour.'],
  ],
  'speed-distance': [
    [/opposite directions/, 'Moving apart in opposite directions, the gap grows at the sum of the speeds.', 'Distance apart after t hours = (v1 + v2) × t.'],
    [/How long will the same distance take/, 'Distance stays the same, so speed × time is constant.', 'New time = old time × old speed ÷ new speed.'],
    [/Convert \d+ km\/h/, 'Multiply km/h by 1000/3600 = 5/18 to get m/s.', 'km/h → m/s: × 5/18. m/s → km/h: × 18/5. 36 km/h = 10 m/s and 72 km/h = 20 m/s are worth remembering.'],
    [/catch/, 'The second person closes the head start at the difference of the speeds.', 'Catch-up time = head-start distance ÷ (faster − slower).'],
    [/of his usual speed, a man reaches/, 'At a fraction n/d of the speed, time becomes d/n of the usual. The extra (d − n)/n of the usual time equals the delay.', 'Usual time = delay × n ÷ (d − n). At 3/4 speed, usual time = 3 × delay.'],
    [/same distance in \d+ hours/, 'Distance stays the same, so speed × time is constant.', 'New speed = old speed × old time ÷ new time.'],
    [/average speed/, 'Average speed = total distance ÷ total time.', 'For two equal distances at a and b, average speed = 2ab ÷ (a + b).'],
    [/.*/, 'Distance = speed × time. Keep the units matching (km with hours, m with seconds).', 'For a fixed distance, speed and time are inversely proportional: double the speed, half the time.'],
  ],
  trains: [
    [/equal length/, 'In opposite directions the relative speed is v1 + v2; together they cover twice one train\'s length.', 'Each length = relative speed (m/s) × time ÷ 2.'],
    [/pole in \d+ seconds and a \d+ m platform/, 'The extra time is spent covering just the platform, which gives the speed; then length = speed × pole time.', 'Length = platform × pole time ÷ (platform time − pole time).'],
    [/stations .* apart and travel towards each other/, 'They close the gap at the sum of their speeds.', 'Meeting time = distance ÷ (v1 + v2).'],
    [/passes a man|man walking/, 'Passing a man means covering only the train\'s own length (a man has no length), at the relative speed: difference of speeds if same direction, sum if opposite.', 'Length = relative speed (m/s) × time.'],
    [/platform|bridge/, 'To cross a platform or bridge, the train must cover its own length plus the platform/bridge length.', 'Distance = train + platform. Convert km/h to m/s with × 5/18 before dividing.'],
    [/opposite directions/, 'Moving towards each other, the relative speed is the sum of the speeds; the distance is the sum of the two lengths.', 'Time = (L1 + L2) ÷ (v1 + v2), with speeds in m/s.'],
    [/overtakes|same direction/, 'Moving the same way, the relative speed is the difference of the speeds; the distance is the sum of the two lengths.', 'Time = (L1 + L2) ÷ (v1 − v2), speeds in m/s.'],
    [/.*/, 'Crossing a pole or a person means covering the train\'s own length. Distance = speed × time with speed in m/s.', 'km/h × 5/18 = m/s. Speeds in multiples of 18 km/h give whole m/s: 54 → 15, 72 → 20, 90 → 25.'],
  ],
  'boats-streams': [
    [/times as long to row a distance upstream/, 'Time is inversely proportional to speed, so (b + s) : (b − s) = k : 1.', 'b : s = (k + 1) : (k − 1). Twice as long → b = 3s; three times → b = 2s.'],
    [/speed in still water\?$|speed of the boat in still water/, 'Downstream speed = b + s and upstream speed = b − s. Adding them cancels s.', 'Boat speed = (downstream + upstream) ÷ 2; stream speed = (downstream − upstream) ÷ 2.'],
    [/speed of the current|speed of the stream/, 'Subtracting upstream from downstream speed leaves 2s.', 'Stream speed = (downstream − upstream) ÷ 2.'],
    [/__never__/, 'Time is inversely proportional to speed, so (b + s) : (b − s) = k : 1.', 'b : s = (k + 1) : (k − 1). Twice as long → b = 3s; three times → b = 2s.'],
    [/and come back|to a place and back/, 'Total time = D ÷ (b + s) + D ÷ (b − s).', 'For a round trip, D = total time × (b² − s²) ÷ (2b).'],
    [/average speed for a round trip/, 'Equal distances downstream and upstream, so average speed = 2 × down × up ÷ (down + up).', 'This simplifies to (b² − s²) ÷ b, always less than the still-water speed.'],
    [/.*/, 'Going with the stream adds its speed (b + s); against it subtracts (b − s). Then use distance = speed × time.', 'Downstream and upstream speeds are all you need: their average is the boat\'s speed, half their difference is the stream.'],
  ],
  'mixtures-alligation': [
    [/In what ratio/, 'Alligation: write the cheaper and dearer prices with the mean in the middle; the ratio is (dearer − mean) : (mean − cheaper).', 'Cross the differences: each quantity is proportional to how far the OTHER price is from the mean.'],
    [/must be mixed with a \d+% solution/, 'Alligation on the percentages: weak : strong = (strong − target) : (target − weak). Then split the total volume in that ratio.', 'Weak part = total × (strong − target) ÷ (strong − weak).'],
    [/In what ratio must they be mixed|alligation/i, 'Alligation: write the cheaper and dearer prices with the mean in the middle; the ratio is (dearer − mean) : (mean − cheaper).', 'Cross the differences: the quantity of each is proportional to how far the OTHER price is from the mean.'],
    [/water must be added to make the ratio/, 'The milk does not change. Find the water needed for the new ratio with the same milk, then subtract the water already there.', 'Keep the unchanged quantity fixed and scale the ratio to it.'],
    [/taken out and replaced/, 'Each replacement keeps (1 − x/V) of the milk.', 'Milk left after n replacements = V × (1 − x/V)^n.'],
    [/price of the mixture per kg/, 'Mean price = total cost ÷ total quantity.', ''],
    [/alcohol|acid|sugar/i, 'The pure substance (alcohol, acid, sugar) stays the same; only the total volume changes. Set the substance equal to the new percent of the new volume.', 'New volume = old volume × old% ÷ new%.'],
    [/sells the mixture at/, 'Find the cost price of the mixture per kg (weighted average), then profit% on that cost.', ''],
    [/.*/, 'Track the quantity that does not change, or use the weighted average: mean = Σ(quantity × value) ÷ Σ quantity.', 'Alligation gives mixing ratios instantly: ratio = (high − mean) : (mean − low).'],
  ],
  'number-system': [
    [/same remainder/, 'If every number leaves the same remainder, the differences are exact multiples of the divisor. The greatest such divisor is the HCF of the differences.', 'HCF of the differences, not of the numbers.'],
    [/leaves a remainder of \d+ when divided by/, 'A number with the same remainder r for several divisors is LCM × k + r. The smallest is LCM + r.', 'Smallest = LCM of the divisors + remainder.'],
    [/bells|intervals/, 'Things that repeat at different intervals happen together again after the LCM of the intervals.', 'LCM via prime factors: take the highest power of each prime.'],
    [/unit digit/, 'Unit digits of powers repeat in a cycle of at most 4. Divide the power by the cycle length and use the remainder.', 'Cycles: 2 → 2,4,8,6; 3 → 3,9,7,1; 7 → 7,9,3,1; 8 → 8,4,2,6; 4 and 9 alternate; 0,1,5,6 never change.'],
    [/remainder/, 'Write the number as divisor × quotient + remainder, or reduce step by step using remainders.', 'Remainders multiply and add: find the remainder of each part first, then combine.'],
    [/factors \(divisors\)/, 'Write N as a product of primes p^a × q^b; the number of factors is (a + 1)(b + 1).', 'Add 1 to each prime power and multiply.'],
    [/same remainder/, 'If every number leaves the same remainder, the differences are exact multiples of the divisor. The greatest such divisor is the HCF of the differences.', 'HCF of the differences, not of the numbers.'],
    [/remainder of \d+ when divided by|leaves a remainder of/, 'A number with the same remainder r for several divisors is LCM × k + r. The smallest is LCM + r.', 'Smallest = LCM of the divisors + remainder.'],
    [/zeros are there at the end/, 'Each trailing zero needs a 10 = 2 × 5; fives are rarer, so count the factors of 5.', 'Zeros = ⌊n/5⌋ + ⌊n/25⌋ + ⌊n/125⌋ + …'],
    [/divisible by 9/, 'A number is divisible by 9 when its digit sum is a multiple of 9.', 'Add the known digits and find what makes the next multiple of 9.'],
    [/HCF|LCM/, 'HCF = product of common prime factors (lowest powers); LCM = product of all prime factors (highest powers).', 'HCF × LCM = product of the two numbers.'],
    [/sum of the first \d+ (natural|odd)/, 'Sum of 1 to n = n(n + 1)/2; sum of the first n odd numbers = n².', ''],
    [/.*/, 'Break numbers into prime factors and use divisibility rules.', 'Divisibility: 3/9 → digit sum; 4 → last two digits; 8 → last three; 11 → alternating digit sum.'],
  ],
  'permutations-combinations': [
    [/arrangements can be made from the letters/, 'Arrangements of n letters = n!, divided by k! for each letter repeated k times.', 'Count repeats first: e.g. BANANA = 6! ÷ (3! × 2!).'],
    [/teams of|committee of \d+ be chosen/, 'Order does not matter in a team, so use combinations; for two groups, choose each and multiply.', 'nCr = nC(n − r): choosing who is in is the same as choosing who is out.'],
    [/letters of the word/, 'Arrangements of n letters = n!, divided by k! for each letter repeated k times.', 'Count repeats first: e.g. BANANA = 6! ÷ (3! × 2!).'],
    [/handshakes/, 'Each handshake is a pair of people, so count pairs: nC2 = n(n − 1)/2.', 'Same formula counts matches in a round-robin league.'],
    [/diagonals/, 'Lines joining any 2 of n corners = nC2; subtract the n sides.', 'Diagonals = n(n − 3)/2.'],
    [/round table/, 'In a circle, rotations are the same arrangement, so fix one person and arrange the rest: (n − 1)!.', ''],
    [/committee/, 'Choose each group separately with combinations and multiply (AND → multiply).', 'nCr = nC(n − r): choosing who is in is the same as choosing who is out.'],
    [/3-digit numbers/, 'Fill the places one by one: n choices, then n − 1, then n − 2 (no repetition).', ''],
    [/always together/, 'Tie the items that must be together into one block, arrange the blocks, then arrange inside the block.', 'Together: (n − 1)! × 2!. Never together = total − together.'],
    [/triangles/, 'Any 3 points that are not on one line make a triangle: nC3.', ''],
    [/at least one/, 'Each item is either chosen or not: 2^n ways, minus the one way of choosing nothing.', ''],
    [/.*/, 'Order matters → permutations (nPr = n!/(n − r)!). Order doesn\'t matter → combinations (nCr = n!/(r!(n − r)!)).', 'AND → multiply the counts; OR → add them.'],
  ],
  probability: [
    [/sum is \d+|sum greater than/, 'Two dice have 36 equally likely outcomes. Count the pairs that give the wanted sum.', 'Sums peak at 7 (6 ways); sum s has 6 − |7 − s| ways.'],
    [/dice/, 'Two dice have 6 × 6 = 36 equally likely outcomes. Count the favourable ones.', 'Count the complement when it is smaller: e.g. an even product = 1 − P(both odd) = 1 − 9/36.'],
    [/coins are tossed/, 'P(at least one head) = 1 − P(no heads) = 1 − (1/2)^n.', '"At least one" is almost always quickest as 1 − P(none).'],
    [/card/, 'A pack has 52 cards: 4 suits of 13, with 4 of each rank. P(A or B) = P(A) + P(B) − P(both).', 'Don\'t double count the card that is in both groups (e.g. the king of hearts).'],
    [/53 Sundays/, 'A year has 52 full weeks plus 1 extra day (2 in a leap year). It has 53 Sundays only if an extra day is a Sunday.', 'Non-leap: 1/7; leap: 2/7.'],
    [/drawn at random without replacement|both are red/, 'Probability = (ways to choose the wanted balls) ÷ (ways to choose any balls), using combinations.', 'Or multiply step by step: (r/total) × ((r − 1)/(total − 1)).'],
    [/multiple of/, 'Count the multiples of k up to N (⌊N/k⌋) and divide by N.', ''],
    [/independently|solved/, 'For independent events, P(both) = P(A) × P(B). P(at least one) = 1 − P(neither).', ''],
    [/.*/, 'Probability = favourable outcomes ÷ total equally likely outcomes. List or count both carefully.', '1 − P(not happening) is often quicker than counting directly.'],
  ],
  mensuration: [
    [/cube with edge/, 'Volume of a cube = edge³; surface area = 6 × edge².', ''],
    [/right-angled triangle/, 'Use Pythagoras: hypotenuse² = sum of the squares of the other two sides. Area = ½ × base × height.', 'Spot triples: 3-4-5, 5-12-13, 8-15-17 and their multiples (9-12-15, 6-8-10).'],
    [/perimeter/, 'Perimeter of a rectangle = 2 × (length + breadth).', ''],
    [/area of a circle/, 'Area of a circle = πr².', 'With π = 22/7, choose r as a multiple of 7 to cancel.'],
    [/diagonal of a square/, 'For a square, area = side² = diagonal² ÷ 2, because diagonal = side × √2.', ''],
    [/surface area of a cuboid/, 'Total surface area = 2(lb + bh + hl): three pairs of equal faces.', ''],
    [/cone/, 'Volume of a cone = ⅓πr²h, one third of the cylinder with the same base and height.', ''],
    [/sphere/, 'Surface area of a sphere = 4πr²; volume = (4/3)πr³.', ''],
    [/path/, 'Area of the path = (outer rectangle) − (inner rectangle). Outside path: add 2 × width to each side.', ''],
    [/rhombus/, 'Area of a rhombus = (d1 × d2) ÷ 2.', ''],
    [/cylinder/, 'Volume of a cylinder = πr²h; curved surface = 2πrh.', ''],
    [/.*/, 'Pick the right formula for the shape and keep the units consistent.', 'Area scales with the square and volume with the cube: double the side → 4× area, 8× volume.'],
  ],
  'data-interpretation': [
    [/total/, 'Add all the values in the table.', 'Add in pairs that make round numbers to avoid slips.'],
    [/difference between the highest and the lowest/, 'Find the largest and smallest values, then subtract.', ''],
    [/increase over the previous year/, 'Subtract each year from the next and compare the changes.', 'Only compare differences, not the values themselves.'],
    [/ratio/, 'Write the two values as a ratio and divide both by their HCF.', ''],
    [/percentage of the five-year total/, 'Share % = that year\'s value ÷ total × 100.', ''],
    [/above the five-year average/, 'Find the average (total ÷ 5), then count the years above it.', ''],
    [/percent(age)? change|change in sales/, 'Percentage change = (new − old) ÷ old × 100. Always divide by the earlier value.', 'A rise from 50 to 75 is +50%, but a fall from 75 to 50 is only −33⅓%.'],
    [/average/, 'Average = total of the values ÷ number of values.', ''],
    [/.*/, 'Read the right rows carefully, then apply the operation the question asks for (sum, difference, ratio, percent).', 'Percentage change is always measured from the earlier value.'],
  ],

  // ---------- verbal ----------
  synonyms: [[/.*/, 'Pick the option whose meaning is closest to the given word. Check it by putting it in a simple sentence in place of the word.', 'Eliminate options with the opposite or an unrelated meaning first; roots help (bene = good, mal = bad, chron = time, loqu = speak).']],
  antonyms: [[/.*/, 'Pick the option with the opposite meaning. First say what the given word means, then look for its opposite.', 'Cross out synonyms of the word first; they are the commonest traps among the options.']],
  spelling: [[/.*/, 'Look at each option letter by letter, especially double letters and vowel pairs (ie/ei, ance/ence).', 'Common traps: accommodate (cc, mm), necessary (one c, ss), occurrence (cc, rr), separate (par), definitely (ite).']],
  idioms: [[/.*/, 'An idiom means something different from its words. Choose the everyday meaning, not the literal one.', 'If an option is a word-for-word reading of the idiom, it is almost always wrong.']],
  'one-word-substitution': [[/.*/, 'Read the description carefully and choose the single word that means exactly that.', 'Use word parts: -cide (killing), -phile (lover), -logy (study), omni- (all), poly- (many), mono- (one).']],
  'fill-in-the-blanks': [[/.*/, 'Read the whole sentence, decide what kind of word fits (verb, preposition, noun) and which meaning the sentence needs.', 'Check grammar first (tense, singular/plural, the right preposition); that usually removes two options at once.']],
  'error-spotting': [[/.*/, 'Check each part for the usual errors: subject–verb agreement, tense, articles, prepositions, pronouns and word order.', 'Find the subject and its verb first; agreement errors are the most frequent in these questions.']],
  'sentence-correction': [[/.*/, 'Compare the options for grammar (agreement, tense, articles, prepositions) and choose the one with no error that keeps the meaning.', 'Look only at where the options differ; the common part is never the problem.']],
  'para-jumbles': [[/.*/, 'Find the opening sentence (it introduces the topic and does not depend on another), then link sentences by pronouns, connectors and time order.', 'Sentences starting with "However", "This", "He/She/It" or "Therefore" cannot come first. Spot one fixed pair and check which options keep it together.']],
  'reading-comprehension': [[/.*/, 'Go back to the passage and find the lines that answer the question; choose the option supported by the passage, not by outside knowledge.', 'For main-idea and tone questions, read the first and last sentences of the passage again; extreme options ("always", "never") are usually wrong.']],

  // ---------- technical (code questions only; concept questions keep their explanation) ----------
  c: CODE('C'),
  cpp: CODE('C++'),
  java: CODE('Java'),
  python: CODE('Python'),
  pseudocode: CODE('pseudocode'),

  // ---------- reasoning ----------
  'number-series': [
    [/missing number/, 'Find the rule from the terms you have (the common difference here), then fill the gap.', 'Check the differences between neighbouring terms first.'],
    [/wrong in the series/, 'Find the rule most terms follow (here, squares), then spot the term that breaks it.', 'Squares and cubes are worth knowing up to 20² and 10³.'],
    [/th term of the series/, 'For an arithmetic series, nth term = a + (n − 1)d.', ''],
    [/Complete the series/, 'Each term is the sum of the two before it (Fibonacci-style).', ''],
    [/What comes next/, 'Look at the differences: they grow by a fixed amount, so continue the differences.', 'If the first differences are not constant, take differences again.'],
    [/Which number should come next/, 'Each term is the previous term × k plus a constant.', 'If terms roughly double or triple, test × 2 or × 3 with a small ± adjustment.'],
    [/Fill in the blank/, 'The terms are cubes with a fixed number added or subtracted.', 'Numbers near 8, 27, 64, 125, 216 hint at cubes.'],
    [/mixed series/, 'Two series alternate. Split odd and even positions and find each rule.', ''],
    [/Which number completes/, 'The terms are squares of consecutive primes.', ''],
    [/sum of the first/, 'The sum of the first n even numbers is n(n + 1).', ''],
    [/.*/, 'Check differences, ratios, squares/cubes and alternating patterns, in that order.', 'Write the differences under the series; most patterns appear in one or two levels of differences.'],
  ],
  'letter-series': [
    [/.*/, 'Convert letters to their positions (A = 1 … Z = 26) and find the pattern in the numbers.', 'Remember E = 5, J = 10, O = 15, T = 20, Y = 25 to count positions quickly (EJOTY).'],
  ],
  'coding-decoding': [
    [/reverse|written in reverse/i, 'Compare the word and its code letter by letter; here the letters are written in reverse order.', ''],
    [/adding letter positions|=\s*\d+/, 'Find how the number is made from the letters (usually by adding their positions, A = 1 … Z = 26), then apply it to the new word.', 'EJOTY: E = 5, J = 10, O = 15, T = 20, Y = 25.'],
    [/.*/, 'Compare each letter with its code to find the shift or rule, then apply the same rule to the new word.', 'Write positions under the letters; a constant difference means a fixed shift.'],
  ],
  'blood-relations': [
    [/.*/, 'Break the statement into one relation at a time, starting from the end ("my father\'s only son" = me), and draw a small family tree.', 'Mark males with +, females with −, and generations on separate lines.'],
  ],
  'direction-sense': [
    [/.*/, 'Track the position on x (East +, West −) and y (North +, South −) after each turn, then use Pythagoras for the straight-line distance.', 'Turning right from North faces East, left faces West. 3-4-5, 6-8-10, 5-12-13 triangles appear often.'],
  ],
  syllogisms: [
    [/.*/, 'Draw a Venn diagram for each statement using the least overlap allowed, then test each conclusion: it follows only if it is true in every possible diagram.', '"All A are B" + "All B are C" → "All A are C". "Some" statements can be reversed; "All" cannot.'],
  ],
  'odd-one-out': [
    [/not prime/, 'A prime has exactly two factors, 1 and itself. Test the others for small divisors (3, 7).', 'Numbers ending in 1, 3, 7, 9 can still be composite: 21, 27, 39, 49, 51, 57.'],
    [/perfect square/, 'Find which number is not n × n for a whole n.', ''],
    [/multiple of/, 'Divide each number by k; the odd one leaves a remainder.', ''],
    [/odd pair/, 'Find the rule linking the numbers in most pairs, then the pair that breaks it.', ''],
    [/word does not belong/, 'Find the category most words share; the odd one belongs to a different group.', ''],
    [/letter group/, 'Write the letter positions and compare the gaps in each group.', ''],
    [/perfect cube/, 'Cubes: 8, 27, 64, 125, 216, 343, 512, 729, 1000.', ''],
    [/.*/, 'Find the property most items share (type, parity, divisibility, pattern); the odd one lacks it.', ''],
  ],
  analogies: [
    [/is to .* as .* is to/, 'Find how the first pair is related (place, use, young one, opposite …) and choose the word with the same relation to the third.', 'Turn the first pair into a sentence ("a doctor works in a hospital") and test each option in it.'],
    [/cube|³/, 'The second number is the cube of the first.', ''],
    [/Letter analogy/, 'Compare letter positions in the first pair to find the shift, then apply it.', ''],
    [/.*/, 'Find the relation in the first pair and apply exactly the same relation to the second.', ''],
  ],
  'seating-arrangement': [
    [/.*/, 'Place the fixed clues first (ends, exact positions), then the relative ones ("next to", "between"), and check every clue at the end.', 'Draw blanks for the seats and try the few possible positions of the most restricted person.'],
  ],
  inequalities: [
    [/.*/, 'Chain the relations through the common letters; a conclusion is definite only if the whole chain points the same way (no "<" and ">" mixed).', 'Opposite signs between two letters (e.g. ≥ then <) mean no definite relation.'],
  ],
  clocks: [
    [/angle between the hour and minute hands|quarter past/, 'Angle = |30H − 5.5M|. The hour hand moves 0.5° a minute, the minute hand 6°.', 'If the answer is above 180°, subtract from 360° for the smaller angle.'],
    [/together/, 'The minute hand gains 5.5° a minute. It must make up the 30H° the hour hand is ahead.', 'They coincide at 60H/11 minutes past H.'],
    [/opposite/, 'The hands are 180° apart: |30H − 5.5M| = 180. Solve for M between 0 and 60.', ''],
    [/How many times in a day/, 'In 12 hours the hands coincide 11 times and are opposite 11 times; right angles happen 22 times.', 'Double everything for a full day.'],
    [/mirror image/, 'A mirror time plus the real time always adds up to 11:60 (12:00).', 'Mirror time = 11:60 − actual time.'],
    [/gains|loses/, 'Multiply the gain or loss per hour (or day) by the time passed.', ''],
    [/hour hand turn|has turned through/, 'The hour hand turns 30° per hour, i.e. 0.5° per minute.', ''],
    [/minute hand turn/, 'The minute hand turns 360° in 60 minutes, i.e. 6° per minute.', ''],
    [/reflex/, 'Find the smaller angle with |30H − 5.5M|, then the reflex angle is 360° minus it.', ''],
    [/strike/, 'Add the strikes for every hour (1 + 2 + … + 12 = 78), plus any extra half-hour strikes.', ''],
    [/.*/, 'Use angle = |30H − 5.5M| and the speeds: minute hand 6°/min, hour hand 0.5°/min.', ''],
  ],
  calendars: [
    [/1 March|1 January/, 'Count the days between the two dates and take the remainder when divided by 7 (odd days).', 'Odd days per month: 31 days → 3, 30 → 2, Feb 28 → 0, Feb 29 → 1.'],
    [/odd days are there in/, 'An ordinary year has 1 odd day and a leap year 2. 100 years have 5 odd days, 200 have 3, 300 have 1, 400 have 0.', ''],
    [/leap year/, 'A year is a leap year if divisible by 4, except century years, which must be divisible by 400.', ''],
    [/calendar of/, 'The calendar repeats when the year starts on the same weekday and has the same number of days.', 'Usually 6 or 11 years later for ordinary years, 28 for leap years.'],
    [/How many Sundays/, 'A month has 4 full weeks (28 days); the extra 0–3 days decide which weekdays appear 5 times.', ''],
    [/.*/, 'Count the days and take the remainder after dividing by 7 (the "odd days"); move that many weekdays forward or back.', 'Days in a week repeat every 7, so only the remainder matters.'],
  ],
  'ranking-order': [
    [/.*/, 'Total = position from one end + position from the other end − 1. Position from the bottom = total − position from the top + 1.', 'The person is counted from both ends, so subtract 1.'],
  ],
  'alphabet-test': [
    [/.*/, 'Use letter positions (A = 1 … Z = 26). From the right, the kth letter is at position 27 − k.', 'EJOTY (5, 10, 15, 20, 25) lets you count positions quickly.'],
  ],
  'logical-arithmetic': [
    [/heads .* legs/, 'Assume every animal is a hen (2 legs); each cow adds 2 extra legs.', 'Cows = (legs − 2 × heads) ÷ 2.'],
    [/from the left and .* from the right/, 'The person is counted in both positions, so total = left + right − 1.', ''],
    [/consecutive numbers/, 'Three consecutive numbers average to the middle one, so middle = sum ÷ 3.', ''],
    [/notes/, 'Assume all notes are the smaller kind, then each bigger note adds the difference.', ''],
    [/HCF/, 'HCF × LCM = product of the two numbers.', ''],
    [/cuts/, 'n pieces need n − 1 cuts.', ''],
    [/digits are used to number the pages/, 'Count 1-digit, 2-digit and 3-digit page numbers separately.', '1–9: 9 digits, 10–99: 180 digits; each page after 99 adds 3.'],
    [/Trees are planted/, 'Gaps = length ÷ spacing; with trees at both ends, trees = gaps + 1.', ''],
    [/.*/, 'Turn the words into a small equation and solve it, or work backwards from the result.', 'Undo the operations in reverse order (subtract before you divide if the number was multiplied then added).'],
  ],
};

const SENT = /(?<=[.!?])\s+(?=[A-Z0-9(₹√|−-])/;

/** Builds the full explanation string for a question in a topic. Leaves non-matching topics unchanged. */
export function fullExplanation(topic, q) {
  const rules = R[topic];
  if (!rules) return q.ex;
  const CODE_TOPICS = ['c', 'cpp', 'java', 'python', 'pseudocode'];
  if (CODE_TOPICS.includes(topic) && !q.code) return q.ex;
  const text = `${q.q}\n${q.code ?? ''}`;
  const rule = rules.find(([re]) => re.test(text)) ?? rules[rules.length - 1];
  const steps = String(q.ex)
    .split(SENT)
    .flatMap((s) => s.split(/;\s+|,\s+so\s+(?=[a-zA-Z0-9₹])/))
    .map((s) => s.trim().replace(/^[a-z]/, (c) => c.toUpperCase()))
    .filter(Boolean);
  const answer = q.options[q.a];
  const lines = [`How to solve: ${rule[1]}`, ...steps.map((s) => `Step: ${s}`)];
  if (!steps.some((s) => s.includes(String(answer)))) lines.push(`Step: So the answer is ${answer}.`);
  if (rule[2]) lines.push(`Shortcut: ${rule[2]}`);
  return lines.join('\n');
}

export const EXPLAINED_TOPICS = Object.keys(R);

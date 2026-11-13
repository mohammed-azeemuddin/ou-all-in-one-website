"""
Source of truth for the coding practice problems. Run:  python3 scripts/coding-src.py
It runs every sample input through the problem's Python reference solution and writes
content/placements/coding.mjs with the real outputs, so a sample can never show a wrong answer.

"asked" tags are candidate-reported (memory-based) from public prep sites and interview posts;
companies do not publish their questions. Statements are written in our own words.
Fields: id, title, topic, level, statement, input, output, constraints, samples (inputs only),
hint, asked [(company, when, source)], solution (Python, reads stdin, prints the answer).
"""
import io, json, os, sys, contextlib

S = {
    'tcs_pi': 'https://prepinsta.com/tcs-coding-questions/',
    'tcs_un': 'https://unstop.com/blog/tcs-nqt-coding-questions',
    'inf_cm': 'https://campusmonk.in/top-50-infosys-coding-questions-2021-2026-se-dse-sp-roles-pyq-easy-medium-hard/',
    'inf_gl': 'https://www.mygreatlearning.com/blog/infosys-sp-dse-coding-questions-with-answers-2026/',
    'wip_fp': 'https://faceprep.in/article/wipro-coding-questions-for-wipro-nlth-2025-wipro-programming-questions-automata/',
    'wip_pp': 'https://placementpapers.app/wipro/coding-questions/',
    'acc_pi': 'https://prepinsta.com/accenture/coding/',
    'acc_pp': 'https://placementpapers.app/accenture/coding-questions/',
    'acc_if': 'https://interviewfox.ai/interview-questions/accenture-hackerrank/',
    'cog_lc': 'https://www.lets-code.co.in/previousyearcodingquestion/cognizantcodingquestions/',
    'cog_un': 'https://unstop.com/blog/cognizant-genc-next-coding-questions',
    'cap_sc': 'https://www.scribd.com/document/920184080/Capgemini-Coding-Assessment-tech6sense',
    'cap_im': 'https://impactmillions.org/capgemini-coding-questions/',
    'hcl_fc': 'https://www.fundocareer.com/blog/interview-guides/hcl-interview-questions-2026',
    'hcl_hy': 'https://hynts.in/preparation/company-wise-dsa-sheet/hcl-dsa-interview-questions/',
    'del_lc': 'https://www.lets-code.co.in/previousyearcodingquestion/deloitte-nla-previous-year-coding-questions/',
    'del_gv': 'https://www.guvi.in/blog/deloitte-nla-experience/',
    'tm_im': 'https://impactmillions.org/tech-mahindra-previous-year-coding-questions/',
    'tm_kg': 'https://www.knowledgegate.ai/blog/tech-mahindra-coding-questions-patterns-and-solved-examples',
    'lti_lc': 'https://leetcode.com/discuss/post/8495039/ltimindtree-interview-experience-2025-ba-bles/',
    'lti_fp': 'https://faceprep.in/article/mindtree-placement-papers-with-solutions-for-mindtree-online-test/',
    'lti_ci': 'https://www.crackinterviewai.in/blog/ltimindtree-interview-questions-freshers',
}

P = []
def add(**k):
    P.append(k)

# ---------------- Arrays ----------------
add(id='second-largest', title='Second largest number', topic='Arrays', level='Easy',
    statement='Read N integers and print the second largest distinct value. If it does not exist, print -1.',
    input='First line: N. Second line: N integers.', output='The second largest distinct value, or -1.',
    constraints='1 ≤ N ≤ 10^5; values fit in a 32-bit integer.',
    samples=['5\n4 9 2 9 7', '3\n5 5 5'],
    hint='Track the largest and second largest in one pass, skipping values equal to the largest.',
    asked=[('infosys', '2022–25', S['inf_cm']), ('accenture', None, S['acc_pp']), ('cognizant-genc', None, S['cog_lc']), ('ltimindtree', None, S['lti_ci'])],
    solution='''n=int(input()); a=list(map(int,input().split()))
s=sorted(set(a)); print(s[-2] if len(s)>1 else -1)''')

add(id='array-rotation', title='Rotate an array', topic='Arrays', level='Easy',
    statement='Read an array and an integer K. Rotate the array to the right by K positions and print it.',
    input='First line: N. Second line: N integers. Third line: K.', output='The rotated array, space-separated.',
    constraints='1 ≤ N ≤ 10^5; 0 ≤ K ≤ 10^9.',
    samples=['5\n1 2 3 4 5\n2', '3\n7 8 9\n4'],
    hint='Use K mod N; the element at index i moves to (i + K) mod N.',
    asked=[('infosys', '2021–25', S['inf_cm']), ('accenture', None, S['acc_pp'])],
    solution='''n=int(input()); a=input().split(); k=int(input())%n
print(*(a[-k:]+a[:-k] if k else a))''')

add(id='missing-number', title='Find the missing number', topic='Arrays', level='Easy',
    statement='The numbers 1 to N were written down, one was lost and the rest were shuffled. Given the N − 1 numbers that remain, print the missing one.',
    input='First line: N. Second line: N − 1 distinct integers from 1 to N.', output='The missing number.',
    constraints='2 ≤ N ≤ 10^6.',
    samples=['5\n1 2 4 5', '2\n2'],
    hint='The sum 1 + 2 + … + N is N(N+1)/2; subtract the sum of what you have.',
    asked=[('infosys', '2021–26', S['inf_cm']), ('wipro-elite-nth', None, S['wip_fp']), ('accenture', None, S['acc_pp']), ('cognizant-genc', None, S['cog_lc']), ('deloitte', '2025', S['del_gv'])],
    solution='''n=int(input()); a=list(map(int,input().split())) if n>1 else []
print(n*(n+1)//2-sum(a))''')

add(id='move-zeros', title='Move zeros to the end', topic='Arrays', level='Easy',
    statement='Move every 0 in the array to the end, keeping the other numbers in their original order.',
    input='First line: N. Second line: N integers.', output='The new array, space-separated.',
    constraints='1 ≤ N ≤ 10^5.',
    samples=['6\n0 1 0 3 12 0', '3\n0 0 5'],
    hint='Copy non-zero values forward with a write pointer, then fill the rest with zeros.',
    asked=[('hcltech', None, S['hcl_hy']), ('deloitte', None, S['del_lc'])],
    solution='''n=int(input()); a=list(map(int,input().split()))
b=[x for x in a if x]; print(*(b+[0]*(n-len(b))))''')

add(id='even-first', title='Even numbers first', topic='Arrays', level='Easy',
    statement='Rearrange the array so all even numbers come before all odd numbers. Keep the original order inside each group.',
    input='First line: N. Second line: N integers.', output='The rearranged array, space-separated.',
    constraints='1 ≤ N ≤ 10^5.',
    samples=['7\n3 8 5 2 9 4 1', '4\n1 3 5 7'],
    hint='Two passes: print the evens in order, then the odds in order.',
    asked=[('wipro-elite-nth', None, S['wip_fp'])],
    solution='''n=int(input()); a=list(map(int,input().split()))
print(*([x for x in a if x%2==0]+[x for x in a if x%2]))''')

add(id='record-breakers', title='Count the record-breakers', topic='Arrays', level='Easy',
    statement='A value is a record if it is bigger than every value before it (the first value always counts). Count the records in the array.',
    input='First line: N. Second line: N integers.', output='The number of records.',
    constraints='1 ≤ N ≤ 10^5.',
    samples=['6\n3 4 1 6 2 7', '4\n5 5 4 3'],
    hint='Keep the running maximum and count each time a value beats it.',
    asked=[('tcs-nqt', 'Sep 2023', S['tcs_pi'])],
    solution='''n=int(input()); a=list(map(int,input().split()))
best=None; c=0
for x in a:
    if best is None or x>best: c+=1; best=x
print(c)''')

add(id='cruise-peak', title='Peak guests on board', topic='Arrays', level='Easy',
    statement='A cruise ship starts empty. Every hour some guests board and then some leave. Given the boarding and leaving counts for each hour, print the largest number of guests on board at the end of any hour.',
    input='First line: H (hours). Second line: H boarding counts. Third line: H leaving counts.', output='The maximum number of guests on board.',
    constraints='1 ≤ H ≤ 10^5; counts never make the total negative.',
    samples=['5\n7 0 5 1 3\n1 2 1 3 4', '3\n2 3 0\n0 1 4'],
    hint='Keep a running total: add the boarders, subtract the leavers, track the maximum.',
    asked=[('tcs-nqt', 'Sep 2023', S['tcs_pi'])],
    solution='''h=int(input()); e=list(map(int,input().split())); x=list(map(int,input().split()))
cur=best=0
for i in range(h):
    cur+=e[i]-x[i]; best=max(best,cur)
print(best)''')

add(id='first-odd-count', title='First colour with an odd count', topic='Arrays', level='Easy',
    statement='Balloons of different colours are listed in order. Print the first colour (by first appearance) that appears an odd number of times. If every colour appears an even number of times, print "All are even".',
    input='First line: N. Second line: N colour names.', output='A colour name, or All are even.',
    constraints='1 ≤ N ≤ 10^5.',
    samples=['6\nred blue red green blue blue', '4\nred red blue blue'],
    hint='Count with a dictionary, then walk the list again in order of first appearance.',
    asked=[('tcs-nqt', 'Sep 2023', S['tcs_pi'])],
    solution='''n=int(input()); a=input().split()
from collections import Counter
c=Counter(a); seen=set()
for x in a:
    if x in seen: continue
    seen.add(x)
    if c[x]%2: print(x); break
else: print('All are even')''')

add(id='row-most-ones', title='Row with the most 1s', topic='Arrays', level='Easy',
    statement='Given a grid of 0s and 1s, print the row number (starting from 1) that has the most 1s. If rows tie, print the smallest row number. If the grid has no 1s at all, print -1.',
    input='First line: R and C. Next R lines: C values (0 or 1).', output='A row number, or -1.',
    constraints='1 ≤ R, C ≤ 1000.',
    samples=['3 4\n0 1 1 0\n1 1 1 0\n0 0 0 1', '2 2\n0 0\n0 0'],
    hint='Sum each row and remember the first row with the biggest sum.',
    asked=[('tcs-nqt', 'Sep 2023', S['tcs_pi'])],
    solution='''r,c=map(int,input().split()); best=0; ans=-1
for i in range(r):
    s=sum(map(int,input().split()))
    if s>best: best=s; ans=i+1
print(ans)''')

add(id='max-subarray-sum', title='Maximum subarray sum', topic='Arrays', level='Medium',
    statement='Find the contiguous part of the array (at least one element) with the largest sum, and print that sum.',
    input='First line: N. Second line: N integers.', output='The largest subarray sum.',
    constraints='1 ≤ N ≤ 10^5; −10^4 ≤ value ≤ 10^4.',
    samples=['9\n-2 1 -3 4 -1 2 1 -5 4', '3\n-3 -1 -2'],
    hint="Kadane's idea: the best sum ending here is either this value alone or this value plus the best sum ending at the previous index.",
    asked=[('infosys', 'SP / DSE', S['inf_gl']), ('cognizant-genc', None, S['cog_lc'])],
    solution='''n=int(input()); a=list(map(int,input().split()))
cur=best=a[0]
for x in a[1:]:
    cur=max(x,cur+x); best=max(best,cur)
print(best)''')

add(id='right-greatest', title='Greatest element on the right', topic='Arrays', level='Easy',
    statement='Replace every element with the greatest element to its right, and the last element with -1. Print the new array.',
    input='First line: N. Second line: N integers.', output='The new array, space-separated.',
    constraints='1 ≤ N ≤ 10^5.',
    samples=['6\n16 17 4 3 5 2', '1\n9'],
    hint='Walk from the right end, carrying the maximum seen so far.',
    asked=[('cognizant-genc', 'GenC Next', S['cog_un'])],
    solution='''n=int(input()); a=list(map(int,input().split()))
out=[0]*n; m=-1
for i in range(n-1,-1,-1):
    out[i]=m; m=max(m,a[i])
print(*out)''')

add(id='middle-sum-triplets', title='Middle equals the sum of its neighbours', topic='Arrays', level='Easy',
    statement='Count the groups of three consecutive elements where the first plus the third equals the middle one.',
    input='First line: N. Second line: N integers.', output='The number of such groups.',
    constraints='1 ≤ N ≤ 10^5.',
    samples=['5\n1 3 2 -1 -3', '4\n1 1 1 1'],
    hint='Check a[i] + a[i+2] == a[i+1] for every i from 0 to N−3.',
    asked=[('cognizant-genc', None, S['cog_lc'])],
    solution='''n=int(input()); a=list(map(int,input().split()))
print(sum(1 for i in range(n-2) if a[i]+a[i+2]==a[i+1]))''')

add(id='merge-sorted', title='Merge two sorted arrays', topic='Sorting and searching', level='Easy',
    statement='Merge two arrays that are already sorted in ascending order into one sorted array, without using a sort function.',
    input='Line 1: N. Line 2: N sorted integers. Line 3: M. Line 4: M sorted integers.', output='The merged array, space-separated.',
    constraints='1 ≤ N, M ≤ 10^5.',
    samples=['3\n1 4 7\n4\n2 3 8 9', '2\n5 5\n1\n5'],
    hint='Two pointers: always take the smaller front element.',
    asked=[('ltimindtree', '2025', S['lti_lc']), ('cognizant-genc', None, S['cog_lc'])],
    solution='''n=int(input()); a=list(map(int,input().split())); m=int(input()); b=list(map(int,input().split()))
i=j=0; out=[]
while i<n and j<m:
    if a[i]<=b[j]: out.append(a[i]); i+=1
    else: out.append(b[j]); j+=1
print(*(out+a[i:]+b[j:]))''')

add(id='subarray-sum-k', title='Subarrays with sum K', topic='Arrays', level='Medium',
    statement='Count the contiguous subarrays whose elements add up to exactly K.',
    input='First line: N. Second line: N integers (may be negative). Third line: K.', output='The number of subarrays.',
    constraints='1 ≤ N ≤ 10^5.',
    samples=['5\n1 2 3 -2 2\n3', '3\n1 1 1\n2'],
    hint='Use prefix sums and a dictionary counting how often each prefix sum has appeared.',
    asked=[('hcltech', None, S['hcl_hy'])],
    solution='''n=int(input()); a=list(map(int,input().split())); k=int(input())
from collections import defaultdict
seen=defaultdict(int); seen[0]=1; s=c=0
for x in a:
    s+=x; c+=seen[s-k]; seen[s]+=1
print(c)''')

add(id='odd-sum-subarrays', title='Subarrays with an odd sum', topic='Arrays', level='Medium',
    statement='Count the contiguous subarrays whose sum is odd.',
    input='First line: N. Second line: N integers.', output='The number of subarrays with an odd sum.',
    constraints='1 ≤ N ≤ 10^5.',
    samples=['3\n1 3 5', '4\n2 4 6 8'],
    hint='A subarray sum is odd when the two prefix sums around it have different parity. Count odd and even prefixes.',
    asked=[('deloitte', None, S['del_lc'])],
    solution='''n=int(input()); a=list(map(int,input().split()))
odd=0; even=1; s=c=0
for x in a:
    s+=x
    if s%2: c+=even; odd+=1
    else: c+=odd; even+=1
print(c)''')

add(id='count-within-diff', title='Count values close to a number', topic='Arrays', level='Easy',
    statement='Count the elements whose distance from a given number is at most D, that is |a[i] − num| ≤ D. If none qualify, print -1.',
    input='Line 1: N. Line 2: N integers. Line 3: num. Line 4: D.', output='The count, or -1.',
    constraints='1 ≤ N ≤ 10^5; 0 ≤ D.',
    samples=['5\n12 3 14 56 77\n13\n2', '3\n1 2 3\n10\n1'],
    hint='Loop once and compare abs(a[i] − num) with D.',
    asked=[('accenture', 'Aug 2022', S['acc_pi']), ('deloitte', None, S['del_lc'])],
    solution='''n=int(input()); a=list(map(int,input().split())); num=int(input()); d=int(input())
c=sum(1 for x in a if abs(x-num)<=d); print(c if c else -1)''')

add(id='longest-decreasing-run', title='Longest decreasing run', topic='Arrays', level='Easy',
    statement='Find the length of the longest stretch of consecutive elements where each element is strictly smaller than the one before it.',
    input='First line: N. Second line: N integers.', output='The length of the longest decreasing run.',
    constraints='1 ≤ N ≤ 10^5.',
    samples=['8\n9 7 4 6 5 3 1 2', '3\n1 2 3'],
    hint='Extend the current run while a[i] < a[i−1], otherwise restart it at 1.',
    asked=[('capgemini', '2026 batch', S['cap_sc'])],
    solution='''n=int(input()); a=list(map(int,input().split()))
best=cur=1
for i in range(1,n):
    cur=cur+1 if a[i]<a[i-1] else 1; best=max(best,cur)
print(best)''')

add(id='pair-min-sum', title='Best sum of pair minimums', topic='Sorting and searching', level='Easy',
    statement='Split 2N numbers into N pairs so that the sum of the smaller number in each pair is as large as possible. Print that sum.',
    input='First line: 2N (an even number). Second line: the 2N integers.', output='The largest possible sum of pair minimums.',
    constraints='2 ≤ 2N ≤ 10^5.',
    samples=['4\n1 4 3 2', '6\n6 2 6 5 1 2'],
    hint='Sort, then pair neighbours: add every second element starting from the first.',
    asked=[('capgemini', '2026 batch', S['cap_sc'])],
    solution='''n=int(input()); a=sorted(map(int,input().split()))
print(sum(a[0::2]))''')

add(id='diagonal-sum', title='Sum of both diagonals', topic='Arrays', level='Easy',
    statement='Given a square matrix, print the sum of its main diagonal and its other diagonal. If N is odd, count the centre element only once.',
    input='First line: N. Next N lines: N integers each.', output='The diagonal sum.',
    constraints='1 ≤ N ≤ 1000.',
    samples=['3\n1 2 3\n4 5 6\n7 8 9', '2\n1 2\n3 4'],
    hint='Add m[i][i] and m[i][N−1−i]; subtract the centre once when N is odd.',
    asked=[('infosys', '2022–24', S['inf_cm']), ('wipro-elite-nth', None, S['wip_pp'])],
    solution='''n=int(input()); m=[list(map(int,input().split())) for _ in range(n)]
s=sum(m[i][i]+m[i][n-1-i] for i in range(n))
if n%2: s-=m[n//2][n//2]
print(s)''')

add(id='rat-count-house', title='Houses needed to feed the rats', topic='Arrays', level='Easy',
    statement='There are R rats and each needs U units of food. Houses are visited in order and each holds some food. Print the smallest number of houses (from the first) whose food together is enough for all the rats. If all houses together are not enough, print 0.',
    input='Line 1: R. Line 2: U. Line 3: N. Line 4: food in each of the N houses.', output='The number of houses, or 0.',
    constraints='1 ≤ N ≤ 10^5.',
    samples=['7\n2\n8\n2 8 3 5 7 4 1 2', '5\n3\n3\n1 2 3'],
    hint='Need = R × U. Add house food one by one until the total reaches the need.',
    asked=[('accenture', 'Aug 2022', S['acc_pi'])],
    solution='''r=int(input()); u=int(input()); n=int(input()); a=list(map(int,input().split()))
need=r*u; s=0; ans=0
for i,x in enumerate(a):
    s+=x
    if s>=need: ans=i+1; break
print(ans)''')

add(id='odd-even-count-diff', title='Odd count minus even count', topic='Arrays', level='Easy',
    statement='Print the number of odd elements minus the number of even elements.',
    input='First line: N. Second line: N integers.', output='One integer (may be negative).',
    constraints='1 ≤ N ≤ 10^5.',
    samples=['7\n5 9 4 8 2 3 6', '3\n1 3 5'],
    hint='One loop with two counters.',
    asked=[('tech-mahindra', '2024', S['tm_im'])],
    solution='''n=int(input()); a=list(map(int,input().split()))
o=sum(1 for x in a if x%2); print(o-(n-o))''')

add(id='red-green-pen', title='Pen switches', topic='Arrays', level='Easy',
    statement='A teacher writes a list of numbers: odd numbers in green, even numbers in red. Count how many times she has to switch from the green pen to the red pen while writing the list in order.',
    input='First line: N. Second line: N integers.', output='The number of green-to-red switches.',
    constraints='1 ≤ N ≤ 10^5.',
    samples=['6\n1 2 3 5 4 6', '3\n2 4 1'],
    hint='Count positions where an odd number is immediately followed by an even number.',
    asked=[('cognizant-genc', None, S['cog_lc'])],
    solution='''n=int(input()); a=list(map(int,input().split()))
print(sum(1 for i in range(1,n) if a[i-1]%2 and a[i]%2==0))''')

add(id='longest-increasing-subsequence', title='Longest increasing subsequence', topic='Dynamic programming', level='Medium',
    statement='Print the length of the longest strictly increasing subsequence (elements need not be next to each other, but must keep their order).',
    input='First line: N. Second line: N integers.', output='The length of the longest increasing subsequence.',
    constraints='1 ≤ N ≤ 10^4.',
    samples=['8\n10 9 2 5 3 7 101 18', '4\n7 7 7 7'],
    hint='dp[i] = 1 + the best dp[j] for j < i with a[j] < a[i]. (A binary-search version runs in N log N.)',
    asked=[('infosys', 'DSE / SP, 2021–26', S['inf_cm'])],
    solution='''import bisect
n=int(input()); a=list(map(int,input().split())); t=[]
for x in a:
    i=bisect.bisect_left(t,x)
    if i==len(t): t.append(x)
    else: t[i]=x
print(len(t))''')

add(id='coin-change', title='Fewest coins', topic='Dynamic programming', level='Hard',
    statement='Given coin values (unlimited coins of each) and an amount, print the smallest number of coins that make the amount exactly. If it cannot be made, print -1.',
    input='Line 1: N (number of coin values). Line 2: the N coin values. Line 3: the amount.', output='The fewest coins, or -1.',
    constraints='1 ≤ N ≤ 100; 0 ≤ amount ≤ 10^4.',
    samples=['3\n1 2 5\n11', '1\n2\n3'],
    hint='dp[x] = 1 + min(dp[x − coin]) over all coins, with dp[0] = 0.',
    asked=[('infosys', 'DSE / SP, 2021–26', S['inf_cm'])],
    solution='''n=int(input()); c=list(map(int,input().split())); amt=int(input())
INF=10**9; dp=[0]+[INF]*amt
for x in range(1,amt+1):
    for v in c:
        if v<=x and dp[x-v]+1<dp[x]: dp[x]=dp[x-v]+1
print(dp[amt] if dp[amt]<INF else -1)''')

# ---------------- Strings ----------------
add(id='palindrome', title='Palindrome check', topic='Strings', level='Easy',
    statement='Read a string and print YES if it reads the same forwards and backwards (ignoring case), otherwise NO.',
    input='One line: the string.', output='YES or NO.',
    constraints='1 ≤ length ≤ 10^5.',
    samples=['Level', 'Placement'],
    hint='Compare characters from both ends moving inwards.',
    asked=[('infosys', '2021–26', S['inf_cm']), ('accenture', None, S['acc_pp']), ('cognizant-genc', None, S['cog_lc']), ('deloitte', 'Feb 2026', S['del_gv']), ('ltimindtree', None, S['lti_ci'])],
    solution='''s=input().strip().lower(); print('YES' if s==s[::-1] else 'NO')''')

add(id='vowel-count', title='Count vowels', topic='Strings', level='Easy',
    statement='Read a line of text and print how many vowels (a, e, i, o, u, either case) it contains.',
    input='One line of text.', output='The number of vowels.',
    constraints='1 ≤ length ≤ 10^5.',
    samples=['Osmania University', 'Rhythm'],
    hint='Lower-case the text and check each character against "aeiou".',
    asked=[('infosys', '2021–23', S['inf_cm']), ('accenture', None, S['acc_pp']), ('cognizant-genc', None, S['cog_lc'])],
    solution='''s=input(); print(sum(ch in 'aeiouAEIOU' for ch in s))''')

add(id='frequency', title='Character frequency', topic='Strings', level='Easy',
    statement='Read a lowercase word and print each distinct character with its count, in order of first appearance.',
    input='One lowercase word.', output='Pairs like b1 a3 n2, space-separated.',
    constraints='1 ≤ length ≤ 10^5.',
    samples=['banana', 'level'],
    hint='Use a dictionary or an array of 26 counts, and remember first-appearance order.',
    asked=[],
    solution='''s=input().strip(); from collections import Counter
c=Counter(s); seen=[]
for ch in s:
    if ch not in seen: seen.append(ch)
print(' '.join(f'{ch}{c[ch]}' for ch in seen))''')

add(id='reverse-words', title='Reverse the words', topic='Strings', level='Easy',
    statement='Reverse the order of the words in a sentence. The letters inside each word stay as they are. Separate the words with single spaces.',
    input='One line: the sentence.', output='The words in reverse order.',
    constraints='1 ≤ length ≤ 10^5.',
    samples=['placements are coming soon', 'hello'],
    hint='Split on spaces, reverse the list, join with one space.',
    asked=[('wipro-elite-nth', None, S['wip_fp']), ('accenture', None, S['acc_pp']), ('hcltech', None, S['hcl_hy'])],
    solution='''print(' '.join(input().split()[::-1]))''')

add(id='first-unique-char', title='First non-repeating character', topic='Strings', level='Easy',
    statement='Print the first character of the string that appears exactly once. If there is none, print -1.',
    input='One line: the string.', output='A character, or -1.',
    constraints='1 ≤ length ≤ 10^5.',
    samples=['swiss', 'aabb'],
    hint='Count every character first, then scan again from the left.',
    asked=[('wipro-elite-nth', None, S['wip_fp']), ('infosys', '2021–25', S['inf_cm']), ('accenture', None, S['acc_pp'])],
    solution='''s=input().strip(); from collections import Counter
c=Counter(s); print(next((ch for ch in s if c[ch]==1),-1))''')

add(id='anagram', title='Anagram check', topic='Strings', level='Easy',
    statement='Two words are anagrams if they use exactly the same letters the same number of times. Ignoring case and spaces, print YES if the two lines are anagrams, otherwise NO.',
    input='Two lines, one string each.', output='YES or NO.',
    constraints='1 ≤ length ≤ 10^5.',
    samples=['Listen\nSilent', 'apple\npapel s'],
    hint='Compare sorted letters, or letter counts.',
    asked=[('infosys', '2021–25', S['inf_cm']), ('accenture', None, S['acc_pp'])],
    solution='''a=input().lower().replace(' ',''); b=input().lower().replace(' ','')
print('YES' if sorted(a)==sorted(b) else 'NO')''')

add(id='valid-brackets', title='Balanced brackets', topic='Strings', level='Medium',
    statement='A string contains only the brackets ( ) [ ] { }. Print YES if every bracket is closed by the right type in the right order, otherwise NO.',
    input='One line: the bracket string.', output='YES or NO.',
    constraints='1 ≤ length ≤ 10^5.',
    samples=['{[()]}()', '([)]'],
    hint='Push opening brackets on a stack; each closing bracket must match the top.',
    asked=[('infosys', '2021–26', S['inf_cm']), ('hcltech', None, S['hcl_hy'])],
    solution='''s=input().strip(); st=[]; pair={')':'(',']':'[','}':'{'}; ok=True
for ch in s:
    if ch in '([{': st.append(ch)
    elif not st or st.pop()!=pair[ch]: ok=False; break
print('YES' if ok and not st else 'NO')''')

add(id='longest-unique-substring', title='Longest substring without repeats', topic='Strings', level='Medium',
    statement='Print the length of the longest substring in which no character repeats.',
    input='One line: the string.', output='The length.',
    constraints='1 ≤ length ≤ 10^5.',
    samples=['abcabcbb', 'bbbbb'],
    hint='Sliding window: remember the last index of each character and move the left edge past repeats.',
    asked=[('infosys', 'DSE / SP, 2021–26', S['inf_cm']), ('tech-mahindra', None, S['tm_kg']), ('ltimindtree', None, S['lti_ci'])],
    solution='''s=input().strip(); last={}; left=best=0
for i,ch in enumerate(s):
    if ch in last and last[ch]>=left: left=last[ch]+1
    last[ch]=i; best=max(best,i-left+1)
print(best)''')

add(id='backspace-compare', title='Typing with backspace', topic='Strings', level='Easy',
    statement='Two people type on a keyboard where # is the backspace key (it deletes the previous character, if any). Given what each typed, print YES if they end up with the same text, otherwise NO.',
    input='Two lines, one typed string each.', output='YES or NO.',
    constraints='1 ≤ length ≤ 10^5.',
    samples=['ab#c\nad#c', 'a#c\nb'],
    hint='Build each final text with a stack: push letters, pop on #.',
    asked=[('tcs-nqt', None, S['tcs_un'])],
    solution='''def f(s):
    st=[]
    for ch in s:
        if ch=='#':
            if st: st.pop()
        else: st.append(ch)
    return ''.join(st)
print('YES' if f(input().strip())==f(input().strip()) else 'NO')''')

add(id='pangram', title='Pangram check', topic='Strings', level='Easy',
    statement='A pangram uses every letter of the English alphabet at least once. Ignoring case and non-letters, print YES if the line is a pangram, otherwise NO.',
    input='One line of text.', output='YES or NO.',
    constraints='1 ≤ length ≤ 10^5.',
    samples=['The quick brown fox jumps over the lazy dog', 'Hello world'],
    hint='Collect the lower-case letters in a set and check its size is 26.',
    asked=[('tcs-nqt', None, S['tcs_un'])],
    solution='''s=input().lower(); print('YES' if len({c for c in s if 'a'<=c<='z'})==26 else 'NO')''')

add(id='longest-sentence', title='Longest sentence', topic='Strings', level='Easy',
    statement='A paragraph is made of sentences that end with a full stop, question mark or exclamation mark. Print the number of words in the longest sentence.',
    input='One line: the paragraph.', output='The word count of the longest sentence.',
    constraints='1 ≤ length ≤ 10^5.',
    samples=['We met. It was a long and happy day! Bye.', 'One sentence only'],
    hint='Split on . ? ! and count the words in each piece.',
    asked=[('tcs-nqt', None, S['tcs_un'])],
    solution='''import re
parts=re.split(r'[.?!]', input()); print(max(len(p.split()) for p in parts))''')

add(id='caesar-shift', title='Shift cipher for letters and digits', topic='Strings', level='Easy',
    statement='Encrypt a message by shifting each letter K places forward in the alphabet (wrapping z to a, keeping its case) and each digit K places forward (wrapping 9 to 0). Other characters stay the same.',
    input='First line: K. Second line: the message.', output='The encrypted message.',
    constraints='0 ≤ K ≤ 10^9; 1 ≤ length ≤ 10^5.',
    samples=['3\nOU2026 rocks!', '27\nzZ9'],
    hint='Use (position + K) mod 26 for letters and mod 10 for digits.',
    asked=[('tcs-nqt', None, S['tcs_pi'])],
    solution='''k=int(input()); s=input(); out=[]
for ch in s:
    if 'a'<=ch<='z': out.append(chr((ord(ch)-97+k)%26+97))
    elif 'A'<=ch<='Z': out.append(chr((ord(ch)-65+k)%26+65))
    elif ch.isdigit(): out.append(str((int(ch)+k)%10))
    else: out.append(ch)
print(''.join(out))''')

add(id='star-hash-balance', title='Stars versus hashes', topic='Strings', level='Easy',
    statement='A string contains only * and # characters. Print the number of * minus the number of #.',
    input='One line: the string.', output='One integer (may be negative).',
    constraints='1 ≤ length ≤ 10^5.',
    samples=['###***#**', '##'],
    hint='Count each character once.',
    asked=[('tcs-nqt', 'Sep 2023', S['tcs_pi'])],
    solution='''s=input().strip(); print(s.count('*')-s.count('#'))''')

add(id='password-checker', title='Password checker', topic='Strings', level='Easy',
    statement='A password is valid when it has at least 8 characters, at least one capital letter, at least one digit, no spaces or slashes, and does not start with a digit. Print Valid or Invalid.',
    input='One line: the password.', output='Valid or Invalid.',
    constraints='1 ≤ length ≤ 100.',
    samples=['Ouall1nOne', '1Password'],
    hint='Check each rule separately with simple loops or any().',
    asked=[('accenture', 'Aug 2022; 2025–26', S['acc_pi']), ('accenture', None, S['acc_if'])],
    solution='''s=input().rstrip('\\n')
ok=len(s)>=8 and any(c.isupper() for c in s) and any(c.isdigit() for c in s) and ' ' not in s and '/' not in s and not s[0].isdigit()
print('Valid' if ok else 'Invalid')''')

add(id='binary-string-ops', title='Evaluate a binary operation string', topic='Strings', level='Easy',
    statement='A string alternates bits and operators, for example 1C0C1C1A0B1. Operators are A (AND), B (OR) and C (XOR). Evaluate it strictly from left to right and print the resulting bit.',
    input='One line: the expression (odd length, starting and ending with a bit).', output='0 or 1.',
    constraints='1 ≤ length ≤ 10^5.',
    samples=['1C0C1C1A0B1', '0'],
    hint='Keep a running value; read an operator and the next bit, apply it, repeat.',
    asked=[('accenture', 'Aug 2022', S['acc_pi'])],
    solution='''s=input().strip(); v=int(s[0])
for i in range(1,len(s),2):
    b=int(s[i+1]); o=s[i]
    v = v&b if o=='A' else v|b if o=='B' else v^b
print(v)''')

add(id='move-hyphens', title='Move hyphens to the front', topic='Strings', level='Easy',
    statement='Move every hyphen (-) to the front of the string, keeping all other characters in their original order.',
    input='One line: the string.', output='The new string.',
    constraints='1 ≤ length ≤ 10^5.',
    samples=['Move-Hyphens-to-Front', 'no-dash-'],
    hint='Count the hyphens, then append the remaining characters in order.',
    asked=[('accenture', 'Aug 2021', S['acc_pi'])],
    solution='''s=input().rstrip('\\n'); print('-'*s.count('-')+s.replace('-',''))''')

add(id='count-unique-chars', title='Count non-repeated characters', topic='Strings', level='Easy',
    statement='Print how many characters appear exactly once in the string (upper and lower case count as different).',
    input='One line: the string.', output='The count.',
    constraints='1 ≤ length ≤ 10^5.',
    samples=['alphaadida', 'aabb'],
    hint='Count every character, then count the ones with frequency 1.',
    asked=[('tech-mahindra', '2024', S['tm_im'])],
    solution='''s=input().rstrip('\\n'); from collections import Counter
print(sum(1 for v in Counter(s).values() if v==1))''')

add(id='equal-01-substring', title='Longest balanced binary substring', topic='Strings', level='Medium',
    statement='In a string of 0s and 1s, find the longest substring with the same number of 0s and 1s. Print its length (0 if there is none).',
    input='One line: the binary string.', output='The length.',
    constraints='1 ≤ length ≤ 10^5.',
    samples=['1101000', '111'],
    hint='Treat 0 as −1 and 1 as +1; equal prefix sums mark a balanced stretch. Store the first index of each prefix sum.',
    asked=[('capgemini', '2026 batch', S['cap_sc'])],
    solution='''s=input().strip(); first={0:-1}; t=best=0
for i,ch in enumerate(s):
    t+=1 if ch=='1' else -1
    if t in first: best=max(best,i-first[t])
    else: first[t]=i
print(best)''')

add(id='prime-string', title='Prime string check', topic='Strings', level='Easy',
    statement='A string is a prime string when both its length and the sum of the ASCII codes of its characters are prime numbers. Print Yes or No.',
    input='One line: the string (no spaces).', output='Yes or No.',
    constraints='1 ≤ length ≤ 1000.',
    samples=['ad', 'abc'],
    hint='Write one is_prime function and use it twice.',
    asked=[('capgemini', '2026 batch', S['cap_sc'])],
    solution='''def isp(n):
    if n<2: return False
    i=2
    while i*i<=n:
        if n%i==0: return False
        i+=1
    return True
s=input().strip(); print('Yes' if isp(len(s)) and isp(sum(map(ord,s))) else 'No')''')

add(id='char-run-count', title='Compress repeated letters', topic='Strings', level='Easy',
    statement='Replace each run of the same character with the character followed by the length of the run.',
    input='One line: the string.', output='The compressed string.',
    constraints='1 ≤ length ≤ 10^5.',
    samples=['aaabbcaa', 'xyz'],
    hint='Walk the string, counting how long the current character repeats.',
    asked=[('capgemini', None, S['cap_im'])],
    solution='''s=input().strip(); out=[]; i=0
while i<len(s):
    j=i
    while j<len(s) and s[j]==s[i]: j+=1
    out.append(s[i]+str(j-i)); i=j
print(''.join(out))''')

add(id='reverse-string', title='Reverse a string', topic='Strings', level='Easy',
    statement='Print the string reversed. Try it without a built-in reverse function.',
    input='One line: the string.', output='The reversed string.',
    constraints='1 ≤ length ≤ 10^5.',
    samples=['Osmania', 'a b c'],
    hint='Swap characters from both ends, or build the result from the last character backwards.',
    asked=[('tech-mahindra', None, S['tm_kg']), ('ltimindtree', None, S['lti_ci']), ('cognizant-genc', None, S['cog_lc'])],
    solution='''s=input().rstrip('\\n'); print(s[::-1])''')

add(id='longest-common-subsequence', title='Longest common subsequence', topic='Dynamic programming', level='Medium',
    statement='Print the length of the longest sequence of characters that appears in both strings in the same order (not necessarily next to each other).',
    input='Two lines, one string each.', output='The length.',
    constraints='1 ≤ length ≤ 1000.',
    samples=['ABCBDAB\nBDCABA', 'abc\ndef'],
    hint='dp[i][j] = dp[i−1][j−1] + 1 when the characters match, otherwise the larger of dp[i−1][j] and dp[i][j−1].',
    asked=[('ltimindtree', None, S['lti_fp'])],
    solution='''a=input().strip(); b=input().strip(); prev=[0]*(len(b)+1)
for x in a:
    cur=[0]
    for j,y in enumerate(b): cur.append(prev[j]+1 if x==y else max(prev[j+1],cur[j]))
    prev=cur
print(prev[-1])''')

# ---------------- Maths and bits ----------------
add(id='prime-range', title='Primes in a range', topic='Maths', level='Easy',
    statement='Read two integers L and R and print all prime numbers between them (inclusive), separated by spaces. If there are none, print -1.',
    input='One line: L and R.', output='The primes, or -1.',
    constraints='1 ≤ L ≤ R ≤ 10^6.',
    samples=['10 30', '24 28'],
    hint='Test divisibility only up to the square root of each number.',
    asked=[('ltimindtree', None, S['lti_ci']), ('tech-mahindra', None, S['tm_kg'])],
    solution='''l,r=map(int,input().split())
def isp(n):
    if n<2: return False
    i=2
    while i*i<=n:
        if n%i==0: return False
        i+=1
    return True
p=[x for x in range(l,r+1) if isp(x)]; print(*p) if p else print(-1)''')

add(id='vehicle-wheels', title='Two-wheelers and four-wheelers', topic='Maths', level='Easy',
    statement='A parking lot has V vehicles with W wheels in total. Every vehicle is a two-wheeler or a four-wheeler. Print the number of two-wheelers and four-wheelers. If no such split is possible, print INVALID.',
    input='One line: V and W.', output='Two numbers (two-wheelers, four-wheelers), or INVALID.',
    constraints='0 ≤ V, W ≤ 10^9.',
    samples=['200 540', '3 5'],
    hint='Four-wheelers = (W − 2V) / 2. It must be a whole number between 0 and V.',
    asked=[('tcs-nqt', 'Sep 2023', S['tcs_pi'])],
    solution='''v,w=map(int,input().split())
if w%2 or w<2*v or w>4*v: print('INVALID')
else:
    f=(w-2*v)//2; print(v-f, f)''')

add(id='armstrong', title='Armstrong number', topic='Maths', level='Easy',
    statement='A number is an Armstrong number if it equals the sum of its digits each raised to the number of digits (153 = 1³ + 5³ + 3³). Print YES or NO.',
    input='One line: N.', output='YES or NO.',
    constraints='0 ≤ N ≤ 10^9.',
    samples=['153', '123'],
    hint='Count the digits first, then add digit^count for each digit.',
    asked=[('hcltech', None, S['hcl_fc']), ('accenture', None, S['acc_pp'])],
    solution='''s=input().strip(); print('YES' if sum(int(d)**len(s) for d in s)==int(s) else 'NO')''')

add(id='power-of-two', title='Power of two', topic='Maths', level='Easy',
    statement='Print YES if N is a power of two (1, 2, 4, 8, …), otherwise NO.',
    input='One line: N.', output='YES or NO.',
    constraints='1 ≤ N ≤ 10^18.',
    samples=['64', '96'],
    hint='A power of two has exactly one set bit: N & (N − 1) is 0.',
    asked=[('infosys', '2022–25', S['inf_cm'])],
    solution='''n=int(input()); print('YES' if n>0 and n&(n-1)==0 else 'NO')''')

add(id='difference-of-sums', title='Difference of sums', topic='Maths', level='Easy',
    statement='Among the numbers 1 to M, add up the ones divisible by N and, separately, the ones not divisible by N. Print the absolute difference of the two sums.',
    input='One line: N and M.', output='The absolute difference.',
    constraints='1 ≤ N, M ≤ 10^6.',
    samples=['4 20', '3 10'],
    hint='Loop once, or use the formula for the sum of multiples.',
    asked=[('accenture', 'Aug 2022', S['acc_pi']), ('deloitte', None, S['del_lc'])],
    solution='''n,m=map(int,input().split())
a=sum(x for x in range(1,m+1) if x%n==0); b=m*(m+1)//2-a; print(abs(a-b))''')

add(id='number-of-carries', title='Count the carries', topic='Maths', level='Easy',
    statement='When two numbers are added digit by digit from the right, print how many times a carry happens.',
    input='One line: two non-negative integers.', output='The number of carries.',
    constraints='0 ≤ numbers ≤ 10^18.',
    samples=['451 349', '123 456'],
    hint='Add the last digits plus the previous carry; a carry happens when that is 10 or more.',
    asked=[('accenture', 'Aug 2021', S['acc_pi'])],
    solution='''a,b=map(int,input().split()); c=0; carry=0
while a or b:
    s=a%10+b%10+carry; carry=1 if s>=10 else 0; c+=carry; a//=10; b//=10
print(c)''')

add(id='decimal-to-base', title='Decimal to base B', topic='Maths', level='Easy',
    statement='Convert a non-negative decimal number N to base B (2 to 36). Use digits 0–9 and then capital letters A–Z.',
    input='One line: N and B.', output='N written in base B.',
    constraints='0 ≤ N ≤ 10^18; 2 ≤ B ≤ 36.',
    samples=['718 12', '255 2'],
    hint='Repeatedly take N mod B as the next digit from the right, then divide N by B.',
    asked=[('accenture', 'Aug 2022', S['acc_pi'])],
    solution='''n,b=map(int,input().split()); D='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'; out=''
if n==0: out='0'
while n: out=D[n%b]+out; n//=b
print(out)''')

add(id='toggle-bits', title='Toggle the bits', topic='Bits', level='Easy',
    statement='Flip every bit of N in its binary form, from the most significant 1 down to the last bit, and print the new number. For example 10 is 1010, which becomes 0101 = 5.',
    input='One line: N.', output='The number after flipping.',
    constraints='1 ≤ N ≤ 10^18.',
    samples=['10', '7'],
    hint='Build a mask of all 1s as long as N in binary, then XOR it with N.',
    asked=[('deloitte', None, S['del_lc'])],
    solution='''n=int(input()); print(n ^ ((1<<n.bit_length())-1))''')

add(id='k-set-bits', title='Numbers with K set bits', topic='Bits', level='Medium',
    statement='Count the integers from 0 to N − 1 whose binary form has exactly K ones.',
    input='One line: N and K.', output='The count.',
    constraints='1 ≤ N ≤ 10^6; 0 ≤ K ≤ 20.',
    samples=['7 2', '16 1'],
    hint='For small N, count the ones in each number with bin(x).count("1") or a bit loop.',
    asked=[('deloitte', None, S['del_lc'])],
    solution='''n,k=map(int,input().split()); print(sum(1 for x in range(n) if bin(x).count('1')==k))''')

add(id='set-bit-positions', title='Set bits and their positions', topic='Bits', level='Easy',
    statement='For N, print three values joined by #: the number of 1 bits, the position of the lowest 1 bit and the position of the highest 1 bit (positions count from 0 at the right). 10 is 1010, so the answer is 2#1#3.',
    input='One line: N.', output='count#lowest#highest',
    constraints='1 ≤ N ≤ 10^18.',
    samples=['10', '15'],
    hint='Count ones with a loop; the lowest position is where the first 1 appears from the right, the highest is bit_length − 1.',
    asked=[('tech-mahindra', '2024', S['tm_im'])],
    solution='''n=int(input()); low=(n & -n).bit_length()-1
print(f"{bin(n).count('1')}#{low}#{n.bit_length()-1}")''')

add(id='remove-digit-max', title='Remove one digit to get the largest number', topic='Strings', level='Easy',
    statement='Given a number (as text) and a digit d that appears in it, remove exactly one occurrence of d so that the remaining number is as large as possible. Print it.',
    input='First line: the number. Second line: the digit d.', output='The largest number possible.',
    constraints='2 ≤ length ≤ 100; d appears at least once.',
    samples=['1231\n1', '551\n5'],
    hint='Remove the first d that is followed by a bigger digit; if there is none, remove the last d. (Trying every occurrence also works for short numbers.)',
    asked=[('infosys', 'DSE / SP, 2023–26', S['inf_cm'])],
    solution='''s=input().strip(); d=input().strip()
print(max(s[:i]+s[i+1:] for i,ch in enumerate(s) if ch==d))''')

add(id='buzz-number', title='Buzz number', topic='Maths', level='Easy',
    statement='A Buzz number either ends with 7 or is divisible by 7. Print Buzz or Not Buzz.',
    input='One line: N.', output='Buzz or Not Buzz.',
    constraints='0 ≤ N ≤ 10^18.',
    samples=['147', '25'],
    hint='Check N % 10 == 7 or N % 7 == 0.',
    asked=[('cognizant-genc', None, S['cog_lc'])],
    solution='''n=int(input()); print('Buzz' if n%10==7 or n%7==0 else 'Not Buzz')''')


def run(sol, text):
    out = io.StringIO()
    old = sys.stdin
    sys.stdin = io.StringIO(text + '\n')
    try:
        with contextlib.redirect_stdout(out):
            exec(sol, {'__name__': '__main__'})
    finally:
        sys.stdin = old
    return out.getvalue().rstrip()


ids = set()
problems = []
for p in P:
    assert p['id'] not in ids, p['id']
    ids.add(p['id'])
    samples = [{'in': s, 'out': run(p['solution'], s)} for s in p['samples']]
    asked = []
    for c, when, src in p['asked']:
        hit = next((a for a in asked if a['company'] == c), None)
        if hit:
            hit['sources'].append(src)
            continue
        a = {'company': c, 'sources': [src]}
        if when:
            a['when'] = when
        asked.append(a)
    problems.append({**{k: p[k] for k in ['id', 'title', 'topic', 'level', 'statement', 'input', 'output', 'constraints', 'hint']},
                     'samples': samples, 'asked': asked, 'solution': p['solution']})

root = os.path.join(os.path.dirname(__file__), '..')
with open(os.path.join(root, 'content/placements/coding.mjs'), 'w') as f:
    f.write('// Generated by scripts/coding-src.py (edit that file, then run: python3 scripts/coding-src.py).\n')
    f.write('// Sample outputs come from running each Python reference solution. "asked" tags are candidate-reported\n')
    f.write('// (memory-based) from public prep sites; `sources` and `solution` stay out of the published data.\n')
    f.write('export const PROBLEMS = ' + json.dumps(problems, ensure_ascii=False, indent=1) + ';\n')
print(f'{len(problems)} problems written')

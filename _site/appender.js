const values = [
    `Major subtleties ahead:  Most hash schemes depend on having a "good" hash
    function, in the sense of simulating randomness.  Python doesn't:  its most
    important hash functions (for ints) are very regular in common
    cases:`,
    `This isn't necessarily bad!  To the contrary, in a table of size 2**i, taking
    the low-order i bits as the initial table index is extremely fast, and there
    are no collisions at all for dicts indexed by a contiguous range of ints. So
    this gives better-than-random behavior in common cases, and that's very
    desirable.`,

    `OTOH, when collisions occur, the tendency to fill contiguous slices of the
    hash table makes a good collision resolution strategy crucial.  Taking only
    the last i bits of the hash code is also vulnerable:  for example, consider
    the list [i << 16 for i in range(20000)] as a set of keys.  Since ints are
    their own hash codes, and this fits in a dict of size 2**15, the last 15 bits
     of every hash code are all 0:  they *all* map to the same table index.`,
     `But catering to unusual cases should not slow the usual ones, so we just take
     the last i bits anyway.  It's up to collision resolution to do the rest.  If
     we *usually* find the key we're looking for on the first try (and, it turns
     out, we usually do -- the table load factor is kept under 2/3, so the odds
     are solidly in our favor), then it makes best sense to keep the initial index
     computation dirt cheap.`,
     `The first half of collision resolution is to visit table indices via this
     recurrence:`,
    
    `For any initial j in range(2**i), repeating that 2**i times generates each
int in range(2**i) exactly once (see any text on random-number generation for
proof).  By itself, this doesn't help much:  like linear probing (setting
j += 1, or j -= 1, on each loop trip), it scans the table entries in a fixed
order.  This would be bad, except that's not the only thing we do, and it's
actually *good* in the common cases where hash keys are consecutive.  In an
example that's really too small to make this entirely clear, for a table of
size 2**3 the order of indices is:`,

`If two things come in at index 5, the first place we look after is index 2,
not 6, so if another comes in at index 6 the collision at 5 didn't hurt it.
Linear probing is deadly in this case because there the fixed probe order
is the *same* as the order consecutive keys are likely to arrive.  But it's
extremely unlikely hash codes will follow a 5*j+1 recurrence by accident,
and certain that consecutive hash codes do not.`,
`The other half of the strategy is to get the other bits of the hash code
into play.  This is done by initializing a (unsigned) vrbl "perturb" to the
full hash code, and changing the recurrence to:`,
`The other half of the strategy is to get the other bits of the hash code
into play.  This is done by initializing a (unsigned) vrbl "perturb" to the
full hash code, and changing the recurrence to:`,
`Now the probe sequence depends (eventually) on every bit in the hash code,
and the pseudo-scrambling property of recurring on 5*j+1 is more valuable,
because it quickly magnifies small differences in the bits that didn't affect
the initial index.  Note that because perturb is unsigned, if the recurrence
is executed often enough perturb eventually becomes and remains 0.  At that
point (very rarely reached) the recurrence is on (just) 5*j+1 again, and
that's certain to find an empty slot eventually (since it generates every int
in range(2**i), and we make sure there's always at least one empty slot).`,

`Selecting a good value for PERTURB_SHIFT is a balancing act.  You want it
small so that the high bits of the hash code continue to affect the probe
sequence across iterations; but you want it large so that in really bad cases
the high-order hash bits have an effect on early iterations.  5 was "the
best" in minimizing total collisions across experiments Tim Peters ran (on
both normal and pathological cases), but 4 and 6 weren't significantly worse.`,

`Historical: Reimer Behrends contributed the idea of using a polynomial-based
approach, using repeated multiplication by x in GF(2**n) where an irreducible
polynomial for each table size was chosen such that x was a primitive root.
Christian Tismer later extended that to use division by x instead, as an
efficient way to get the high bits of the hash code into play.  This scheme
also gave excellent collision statistics, but was more expensive:  two
if-tests were required inside the loop; computing "the next" index took about
the same number of operations but without as much potential parallelism
(e.g., computing 5*j can go on at the same time as computing 1+perturb in the
above, and then shifting perturb can be done while the table index is being
masked); and the PyDictObject struct required a member to hold the table's
polynomial.  In Tim's experiments the current scheme ran faster, produced
equally good collision statistics, needed less code & used less memory.`

];



console.log(values.map((ele)=>ele.split('\n').join(' ')).join('\n\n'));
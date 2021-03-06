import {List, Map, Set} from 'immutable'

export const INITIAL_STATE = Map()

export function setContent(state, entries, traits) {
  const entriesList = List(entries)
  const traitsList = List(traits)

  return state.set('entries', entriesList)
              .set('initialEntries', entriesList)
              .set('traits', traitsList)
              .set('initialTraits', traitsList)
}

export function next(state, round = state.getIn(['vote', 'round'], 0)) {
  const traits = state.get('traits')
  // Each vote round's Winner goes back to the Entries:
  const winners = getWinners(state.get('vote'))
  const entries = state.get('entries').concat(winners)

  // FOR RESULTS
  const results = state.get('results') || Map({})
  const tally = state.getIn(['vote', 'tally'])
  const newResults = results.mergeDeepWith((prev, next, key) => {
    return prev + next
  }, tally)

  // NEXT: With every vote, I want to append a new tally into results.
  // Can I use the union method from Set()?

  return state.merge({
    vote: Map({
      round: round + 1,
      pair: entries.take(2),
      trait: traits.get(0) // Lists are zero-indexed
    }),
    entries: entries.skip(2),
    traits: traits.skip(1),
    results: newResults
  })
}
// results: {
//  sparrow: {sad: 1},
//  starling: {honest: 1},
// }

export function vote(voteState, entry) {
  if (voteState.get('pair').includes(entry)) {
    const trait = voteState.get('trait')

    return voteState.updateIn(
      ['tally', entry, trait],
      0, // Default tally value
      tally => tally + 1
    )
  } else {
    return voteState
  }
}

function getWinners(vote) {
  if (!vote) return []
  const [a, b] = vote.get('pair')
  const aVotes = vote.getIn(['tally', 'trait', a], 0)
  const bVotes = vote.getIn(['tally', 'trait', b], 0)

  if (aVotes > bVotes) return [a]
  else if (aVotes < bVotes) return [b]
  else return [a, b]
}

export function restart(state) {
  const round = state.getIn(['vote', 'round'], 0)
  const initialEntries = state.get('initialEntries')
  const initialTraits = state.get('initialTraits')

  return next(
    state.set('entries', initialEntries)
         .set('traits', initialTraits)
         .remove('vote'),
    round
  )
}

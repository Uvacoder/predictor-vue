import { RepositoryFactory } from '@/api/repository-factory'
import { saveState, getSavedState } from '@/utils/helpers'
import Vue from 'vue'
const MatchesRepository = RepositoryFactory.get('matches')

export const state = {
  cached: [],
  matches: getSavedState('matches'),
}

export const getters = {
  matches(state) {
    return state.matches || []
  },
}

export const mutations = {
  SET_MATCHES(state, newValue) {
    state.matches = newValue
    saveState('matches', newValue)
  },
  SET_PREDICTION(state, prediction) {
    const matchIndex = state.matches.findIndex(
      match => match.id === prediction.matchId
    )
    Vue.set(state.matches[matchIndex], 'prediction', prediction)
    saveState('matches', state.matches)
  },
}

export const actions = {
  fetchMatches({ commit, rootGetters }, { competitionId, userId } = {}) {
    const filters = {
      competitionId:
        competitionId || rootGetters['competitions/currentCompetition'].id,
    }
    if (userId) filters['userId'] = userId
    return MatchesRepository.get(filters).then(response => {
      commit('SET_MATCHES', response.data)
      return response.data
    })
  },
  setPrediction({ commit }, { match, choice }) {
    const action = match.prediction ? 'patchPrediction' : 'postPrediction'
    return MatchesRepository[action](match.id, choice).then(response => {
      commit('SET_PREDICTION', response.data)
      return response.data
    })
  },
}

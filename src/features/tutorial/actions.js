function tutorialNextStep(route){
  return { type: 'TUTORIAL_NEXT_STEP', route }
}
function submitTutorialForm(data, object){
  return { type: 'UPDATE_TUTORIAL', object, data }
}

let actions = {
  showTutorialHeader: { type: 'SHOW_TUTORIAL_HEADER' },
  hideTutorialHeader: { type: 'HIDE_TUTORIAL_HEADER' },
  tutorialNextStep,
  submitTutorialForm
}

export default actions

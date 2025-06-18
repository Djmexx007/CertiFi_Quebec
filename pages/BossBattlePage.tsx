import React from 'react'
import BossBattle from '../components/BossBattle'
import HeaderBar from '../components/ui/HeaderBar'

const quiz = [
  {
    question: 'Quelle est la capitale du Canada ?',
    choices: [
      { text: 'Toronto', correct: false, explanation: 'Fausse réponse.' },
      { text: 'Ottawa', correct: true, explanation: 'Exact ! Ottawa est la capitale.' },
      { text: 'Montréal', correct: false, explanation: 'Ce n’est pas la capitale.' },
    ],
  },
  {
    question: 'Combien y a-t-il de provinces au Canada ?',
    choices: [
      { text: '10', correct: true, explanation: 'Bonne réponse : 10 provinces.' },
      { text: '13', correct: false, explanation: '13 inclut les territoires, mais il y a 10 provinces.' },
      { text: '12', correct: false, explanation: 'Ce n’est pas exact.' },
    ],
  },
]

export default function BossBattlePage() {
  return (
    <div>
      <HeaderBar title="Combat contre le Boss" />
      <div className="p-4">
        <BossBattle
          name="Boss de Géographie"
          quiz={quiz}
          onWin={() => alert('🎉 Victoire !')}
          onLose={() => alert('💀 Défaite. Retente ta chance !')}
        />
      </div>
    </div>
  )
}

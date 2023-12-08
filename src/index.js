function showHint(message) {
  const hint = document.getElementById('hint')
  hint.textContent = message
  hint.style.display = 'block'
  setTimeout(() => {
    hint.style.display = 'none'
  }, 3000)
  updateUI()
}
const defaultUserFeedback = () => {
  showHint('Gespeichert!')
}
document.querySelector('#activate-script').addEventListener('click', async () => {
  chrome.storage.sync.set({ active: true }).then(() => showHint('Aktiviert!'))
})

document.querySelector('#deactivate-script').addEventListener('click', async () => {
  chrome.storage.sync.set({ active: false }).then(() => showHint('Deaktiviert!'))
})

document.querySelector('#add-author').addEventListener('click', async () => {
  const authorName = document.querySelector('#author-name').value.trim()
  chrome.storage.sync.get(['authors']).then(result => {
    const newAuthors = result.authors || []
    if (authorName && !newAuthors.includes(authorName)) {
      newAuthors.push(authorName)
      chrome.storage.sync.set({ authors: newAuthors }).then(() => showHint('Hinzugefügt!'))
    }
  })
})

document.querySelector('#remove-authors').addEventListener('click', async () => {
  const checkedAuthors = document.querySelectorAll('.blocked-author:checked')
  const namesToUnblock = [...checkedAuthors].map(element => element.value)
  chrome.storage.sync.get(['authors']).then(result => {
    const oldAuthors = result.authors || []
    const newAuthors = oldAuthors.filter(element => !namesToUnblock.includes(element))
    if (oldAuthors.toString() !== newAuthors.toString()) {
      chrome.storage.sync.set({ authors: newAuthors }).then(() => showHint('Freigegeben!'))
    }
  })
})

document.querySelector('#hide-answers').addEventListener('change', async () => {
  const hideAnswers = document.querySelector('#hide-answers').checked
  chrome.storage.sync.set({ hideAnswers }).then(defaultUserFeedback)
})

document.querySelector('#hide-headers').addEventListener('change', async () => {
  const hideHeaders = document.querySelector('#hide-headers').checked
  chrome.storage.sync.set({ hideHeaders }).then(defaultUserFeedback)
})

document.querySelector('#rating-lower-bound').addEventListener('keydown', async event => {
  if (event.keyCode === 13) {
    const lowerBound = parseFloat(document.querySelector('#rating-lower-bound').value)
    if (!Number.isNaN(lowerBound)) {
      chrome.storage.sync.set({ lowerBound }).then(defaultUserFeedback)
    } else {
      chrome.storage.sync.remove(['lowerBound']).then(defaultUserFeedback)
    }
  }
})

document.querySelector('#rating-upper-bound').addEventListener('keydown', async event => {
  if (event.keyCode === 13) {
    const upperBound = parseFloat(document.querySelector('#rating-upper-bound').value)
    if (!Number.isNaN(upperBound)) {
      chrome.storage.sync.set({ upperBound }).then(defaultUserFeedback)
    } else {
      chrome.storage.sync.remove(['upperBound']).then(defaultUserFeedback)
    }
  }
})
function updateUI() {
  chrome.storage.sync.get(['authors', 'hideAnswers', 'hideHeaders', 'lowerBound', 'upperBound', 'active']).then(result => {
    document.querySelector('#hide-answers').checked = !!result.hideAnswers
    document.querySelector('#hide-headers').checked = !!result.hideHeaders
    document.getElementById('blocked-users').replaceChildren(
      ...(result.authors || []).map(authorName => {
        const label = document.createElement('label')

        const checkbox = document.createElement('input')
        checkbox.type = 'checkbox'
        checkbox.value = authorName
        checkbox.className = 'blocked-author'
        label.appendChild(checkbox)

        const span = document.createElement('span')
        span.textContent = authorName
        label.appendChild(span)

        return label
      })
    )
    document.querySelector('#rating-lower-bound').value = typeof result.lowerBound !== 'undefined' ? result.lowerBound : ''
    document.querySelector('#rating-upper-bound').value = typeof result.upperBound !== 'undefined' ? result.upperBound : ''
    document.querySelector('#activate-script').toggleAttribute('disabled', !!result.active)
    document.querySelector('#deactivate-script').toggleAttribute('disabled', !result.active)
  })
}

updateUI()

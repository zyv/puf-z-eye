const DYNAMIC_SCRIPT_ID = 'puf-z-eye'

function showHint(message) {
  const hint = document.getElementById('hint')
  hint.textContent = message
  hint.style.display = 'block'
  setTimeout(() => {
    hint.style.display = 'none'
  }, 3000)
}

async function isDynamicContentScriptRegistered() {
  const scripts = await chrome.scripting.getRegisteredContentScripts()
  return scripts.some(s => s.id === DYNAMIC_SCRIPT_ID)
}

document.querySelector('#register-dynamic').addEventListener('click', async () => {
  await chrome.scripting.registerContentScripts([
    {
      id: DYNAMIC_SCRIPT_ID,
      js: ['content-script.js'],
      persistAcrossSessions: true,
      matches: ['https://www.pilotundflugzeug.de/forum/*'],
      runAt: 'document_end'
    }
  ])
  updateUI()
})

document.querySelector('#unregister-dynamic').addEventListener('click', async () => {
  await chrome.scripting.unregisterContentScripts({ ids: [DYNAMIC_SCRIPT_ID] })
  updateUI()
})

document.querySelector('#add-author').addEventListener('click', async () => {
  const authorName = document.querySelector("[name='author-name']").value.trim()
  chrome.storage.sync.get(['authors']).then(result => {
    const newAuthors = result.authors || []
    if (authorName && !newAuthors.includes(authorName)) {
      newAuthors.push(authorName)
      chrome.storage.sync.set({ authors: newAuthors }).then(() => {
        showHint('Hinzugefügt!')
        updateUI()
      })
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
      chrome.storage.sync.set({ authors: newAuthors }).then(() => {
        updateUI()
        showHint('Freigegeben!')
      })
    }
  })
})

document.querySelector('#hide-answers').addEventListener('change', async () => {
  const hideAnswers = document.querySelector('#hide-answers').checked
  chrome.storage.sync.set({ hideAnswers }).then(() => {
    showHint('Gespeichert!')
    updateUI()
  })
})

document.querySelector('#hide-headers').addEventListener('change', async () => {
  const hideHeaders = document.querySelector('#hide-headers').checked
  chrome.storage.sync.set({ hideHeaders }).then(() => {
    showHint('Gespeichert!')
    updateUI()
  })
})

function updateUI() {
  chrome.storage.sync.get(['authors', 'hideAnswers', 'hideHeaders']).then(result => {
    document.querySelector('#hide-answers').checked = !!result.hideAnswers
    document.querySelector('#hide-headers').checked = !!result.hideHeaders
    document.getElementById('blocked-users').replaceChildren(
      ...(result.authors || []).map(author => {
        const label = document.createElement('label')

        const checkbox = document.createElement('input')
        checkbox.type = 'checkbox'
        checkbox.value = author
        checkbox.className = 'blocked-author'
        label.appendChild(checkbox)

        const span = document.createElement('span')
        span.textContent = author
        label.appendChild(span)

        return label
      })
    )
  })

  isDynamicContentScriptRegistered().then(dynamicContentScriptRegistered => {
    document.querySelector('#register-dynamic').toggleAttribute('disabled', dynamicContentScriptRegistered)
    document.querySelector('#unregister-dynamic').toggleAttribute('disabled', !dynamicContentScriptRegistered)
  })
}

updateUI()

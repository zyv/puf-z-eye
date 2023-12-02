chrome.storage.sync.get(['authors', 'hideAnswers']).then(result => {
  for (const author of result.authors || []) {
    const postsFromAuthor = document.querySelectorAll('.messageHeader b > a')
    const postsToAuthor = [...document.querySelectorAll('.messageHeader :not(b) > a')]

    const postsToHide = (result.hideAnswers ? [...postsFromAuthor, ...postsToAuthor] : [...postsFromAuthor]).filter(
      element => element.innerText === author
    )

    for (const post of postsToHide) {
      const heading = post.closest('tr')
      const messages = heading.nextElementSibling
      const buttons = messages.nextElementSibling
      buttons.remove()
      messages.remove()
    }
  }
})
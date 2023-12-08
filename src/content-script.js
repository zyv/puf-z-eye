chrome.storage.sync.get(['authors', 'hideAnswers', 'hideHeaders', 'active', 'upperBound', 'lowerBound']).then(result => {
  if (!result.active) {
    return
  }

  const postsToHide = new Set()

  // Filtering by rating
  const aPostsWithNegativeRatings = document.querySelectorAll('.messageHeader b font[color="#CC0000"]')
  const aPostsWithPositiveRatings = document.querySelectorAll('.messageHeader b font[color="#339900"]')
  const aPostsWithNeutralRatings = document.querySelectorAll('.messageHeader b font[color="#000000"]')

  for (const aPost of [...aPostsWithNegativeRatings, ...aPostsWithPositiveRatings, ...aPostsWithNeutralRatings]) {
    const rating = parseFloat(aPost.textContent)
    if (typeof result.lowerBound !== 'undefined') {
      if (rating < result.lowerBound) {
        postsToHide.add(aPost.closest('tr'))
      }
    }
    if (typeof result.upperBound !== 'undefined') {
      if (rating > result.upperBound) {
        postsToHide.add(aPost.closest('tr'))
      }
    }
  }

  // Filtering by author
  for (const author of result.authors || []) {
    const aPostsFromAuthor = document.querySelectorAll('.messageHeader b > a')
    const aPostsToAuthor = document.querySelectorAll('.messageHeader :not(b) > a')

    ;(result.hideAnswers ? [...aPostsFromAuthor, ...aPostsToAuthor] : [...aPostsFromAuthor])
      .filter(element => element.innerText === author)
      .forEach(aPost => postsToHide.add(aPost.closest('tr')))
  }

  const elementsToRemove = new Set()

  for (const header of postsToHide) {
    let message = header.nextElementSibling

    // Also hide attachment carousel if it was captured instead of buttons
    while (message.querySelector("font[class='messageText']") !== null) {
      elementsToRemove.add(message)
      message = message.nextElementSibling
    }

    // Remove rating buttons
    elementsToRemove.add(message)

    if (result.hideHeaders) {
      elementsToRemove.add(header)
    }
  }

  elementsToRemove.forEach(element => element.remove())
})

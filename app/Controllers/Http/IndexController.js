'use strict'

class IndexController {
  async render ({ request, view }) {
    return view.render('index')
  }
}

module.exports = IndexController

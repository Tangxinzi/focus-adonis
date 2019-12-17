'use strict'

class IndexController {
  async render ({ request, view }) {
    return view.render('welcome')
  }
}

module.exports = IndexController

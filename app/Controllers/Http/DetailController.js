'use strict'

const superagent    = use('superagent')
const cheerio       = use('cheerio')

class DetailController {
  htmlToSearchMovieData (html) {
    const dataset = []
    const $ = cheerio.load(html.text)
    const contentListItem = $('#content_list .list-item')
    contentListItem.each((index, element) => {
      let data = {
        index,
        title: contentListItem.eq(index).find('a').text(),
        imdb: contentListItem.eq(index).find('span.list-imdb').text(),
        douban: contentListItem.eq(index).find('span.list-douban').text(),
        time: contentListItem.eq(index).text().split(/ /)[5],
        href: {
          id: contentListItem.eq(index).find('a').attr('href').split(/\S+\.cc\//)[1].split(/\//)[1].split(/\.htm/)[0],
          type: contentListItem.eq(index).find('a').attr('href').split(/\S+\.cc\//)[1].split(/\//)[0]
        }
      }

      dataset.push(data)
    })
    return {
      num: $('.badge-warning').text(),
      dataset: dataset
    }
  }

  htmlToSearchBaiduyunData (html) {
    const $ = cheerio.load(html.text)
    const wrap = $('.result-wrap .resource-item-wrap')
    const dataset = []
    wrap.each((index, element) => {
      let data = {
        text: wrap.eq(index).find('.valid').text(),
        href: wrap.eq(index).find('.valid').attr('href').split(/\/detail\//)[1],
        size: wrap.eq(index).find('span.em').text(),
        date: wrap.eq(index).find('p.time').text(),
        detail: []
      }

      const detail = wrap.eq(index).find('.detail-item-wrap')
      detail.each((index, element) => {
        let item = detail.eq(index).text()
        data.detail.push(item)
      })

      dataset.push(data)
    })
    return {
      num: $('.tip span.em').text(),
      dataset: dataset
    }
  }

  async render ({ request, view }) {
    const wd = request.input('wd')
    console.log(wd)
    var response = await superagent.get(encodeURI(`https://www.bd-film.cc/search.jspx?q=${ wd }`))
    const dataset = this.htmlToSearchMovieData(response)

    var response = await superagent.get(encodeURI(`https://www.dalipan.com/search?keyword=${ wd }`))
    const baiduyun = this.htmlToSearchBaiduyunData(response)

    return view.render('detail', { dataset, baiduyun, wd })
  }
}

module.exports = DetailController

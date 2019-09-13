'use strict'

const superagent    = use('superagent')
const cheerio       = use('cheerio')
const { validate }  = use('Validator')
require('superagent-charset')(superagent)

class DetailController {
  async store ({ request, view, response, session }) {
    const rules = {
      url: 'required'
    }
    const validation = await validate(request.all(), rules)
    const result = await superagent.post('http://tools.bugscaner.com/api/baiduyunpassword/')
      .charset('gbk')
      .type('form')
      .send({ baiduyunurl: request.input('url') })
    const json = JSON.parse(result.text)

    if (json.secess) {
      session.flash({
        type: 'blue',
        header: '验证成功',
        message: `您可以访问 <a href="${ request.input('url') }" target="_blank" rel="noreferrer">${ request.input('url') }</a>，提取码为 ${ json.info.split(/:/)[1] }`
      })
    } else {
      session.flash({
        type: 'red',
        header: '验证失败',
        message: `请检查您的链接是否正确`
      })
    }

    return response.redirect('back')
  }

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

  async index ({ request, view }) {
    const wd = request.input('wd')
    var response = await superagent.get(encodeURI(`https://www.bd-film.cc/search.jspx?q=${ wd }`))
    const dataset = this.htmlToSearchMovieData(response)

    var response = await superagent.get(encodeURI(`https://www.dalipan.com/search?keyword=${ wd }`))
    const baiduyun = this.htmlToSearchBaiduyunData(response)

    return view.render('detail', { dataset, baiduyun, wd })
  }
}

module.exports = DetailController

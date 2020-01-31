'use strict'

const superagent    = use('superagent')
const cheerio       = use('cheerio')
const { validate }  = use('Validator')
require('superagent-charset')(superagent)

class DetailController {
  async baiduyunPassword (url) {
    const result = await superagent.post('http://tools.bugscaner.com/api/baiduyunpassword/')
      .charset('gbk')
      .buffer(true)
      .type('form')
      .send({ baiduyunurl: url })

    const json = JSON.parse(result.text)

    if (json.secess) {
      return {
        type: 'blue',
        header: '验证成功',
        message: `您可以访问 <a href="${ request.input('url') }" target="_blank" rel="noreferrer">${ request.input('url') }</a>，提取码为 ${ json.info.split(/:/)[1] }`
      }
    } else {
      return {
        type: 'red',
        header: '验证失败',
        message: `${ json.info }`
      }
    }
  }

  htmlToSearchBaiduyunData (html) {
    const $ = cheerio.load(html.text)
    const wrap = $('.container .searchRow')
    const dataset = []
    wrap.each((index, element) => {
      let data = {
        text: wrap.eq(index).find('.link a').text(),
        href: wrap.eq(index).find('.link a').attr('href'),
        info: {
          size: wrap.eq(index).find('.info .size').text(),
          type: wrap.eq(index).find('.info .ftype').text(),
          date: wrap.eq(index).find('.info .upload').text(),
          home: wrap.eq(index).find('.info .home').text()
        }
      }
      dataset.push(data)
    })

    return {
      num: $('.total-results').text(),
      dataset
    }
  }

  async index ({ request, view }) {
    const page = request.input('page')
    const type = request.input('type')
    const wd = request.input('wd')
    const url = request.input('url')
    if (!url) {
      var response = await superagent.get(encodeURI(`http://slimego.cn/search.html?page=${ page || 1 }&rows=7&type=${ type || 'all' }&q=${ wd }`))
      const baiduyun = this.htmlToSearchBaiduyunData(response)
      return { baiduyun, wd }
    } else {
      return this.baiduyunPassword(url)
    }
  }
}

module.exports = DetailController

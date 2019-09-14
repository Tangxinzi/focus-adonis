'use strict'

const superagent    = use('superagent')
const cheerio       = use('cheerio')
require('superagent-charset')(superagent)

class IndexController {
  async htmlToPassRecommendSourceData () {
    const response = await superagent.get('http://www.hao6v.com').charset('gbk').buffer(true)
    const $ = cheerio.load(response.text)
    const dataset = {
      col1: [],
      col2: [],
      col3: []
    }
    var col1 = $('.col1').first().find('li')
    col1.each((index, element) => {
      let item = {
        text: col1.eq(index).find('img').attr('alt'),
        href: col1.eq(index).find('a').attr('href')
      }
      dataset.col1.push(item)
    })
    var col1 = $('.col1').last().find('li')
    col1.each((index, element) => {
      let item = {
        text: col1.eq(index).find('img').attr('alt'),
        href: col1.eq(index).find('a').attr('href')
      }
      dataset.col2.push(item)
    })
    var col3 = $('.col3 .box.mt6').last().find('li')
    col3.each((index, element) => {
      let item = {
        text: col3.eq(index).find('a').text(),
        date: col3.eq(index).find('span').text(),
        href: col3.eq(index).find('a').attr('href')
      }
      dataset.col3.push(item)
    })
    return dataset
  }

  async htmlToPassMeijuSourceData () {
    const response = await superagent.get('http://www.ttzmz.vip').charset('utf-8').buffer(true)
    const $ = cheerio.load(response.text)
    const wrap = $('.divfirst .whlist li')
    const dataset = []
    wrap.each((index, element) => {
      let item = {
        text: wrap.eq(index).find('.detailname').text(),
        href: wrap.eq(index).find('a').attr('href')
      }
      dataset.push(item)
    })

    return dataset
  }

  async render ({ request, view }) {
    const dataset = {
      recommend: await this.htmlToPassRecommendSourceData(),
      // meiju: await this.htmlToPassMeijuSourceData()
    }

    return view.render('index', { dataset })
  }
}

module.exports = IndexController

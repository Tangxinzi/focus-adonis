'use strict'

const superagent    = use('superagent')
const cheerio       = use('cheerio')
const axios         = use('axios')
const iconv         = use('iconv-lite')

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

  htmlToSearchMovieSourceData (html) {
    const $ = cheerio.load(html.text)
    const content = $('.content')
    let dataset = {
      p: 'source',
      title: content.find('h3').text(),
      description: $('#plot .plot').text(),
      content: {
        attrs: content.text().split(/导演: /)[1].split(/编剧: /)[0],
        local: content.text().split(/制片国家\/地区: /)[1].split(/语言: /)[0],
        runtime: content.text().split(/片长: /)[1].split(/又名: /)[0],
        date: content.text().split(/上映日期: /)[1].split(/片长: /)[0],
        screenwriter: content.text().split(/编剧: /)[1].split(/主演: /)[0],
        actor: content.text().split(/主演: /)[1].split(/类型: /)[0],
        type: content.text().split(/类型: /)[1].split(/制片国家\/地区: /)[0],
        douban: {
          count: content.find('a.db').text(),
          href: content.eq(0).find('a.db')[0].href
        },
        imdb: {
          count: content.find('a.imdb').text(),
          href: content.find('a.imdb')[0].href
        },
        download: []
      }
    }
    const option = $('#address .option')
    option.each((index, element) => {
      let data = {
        text: option.eq(index).children('a').text(),
        href: option.eq(index).children('a').attr('href'),
        size: $('#address .option').eq(index).find('.pull-right').children('span').text(),
        label: []
      }

      const label = option.find('a.label')
      option.eq(index).find('a.label').each((i, element) => {
        let type = {
          // text: label.eq(i).text(),
          // url: label.eq(i).attr('data-clipboard-text')
        }
        data.label.push(type)
      })
      dataset.content.download.push(data)
    })
    return dataset
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

  htmlToSearchBaiduyunSourceData (html) {
    const $ = cheerio.load(html.text)
    const info = $('#info')
    let dataset = {
      p: 'baiduyun',
      title: info.find('h1.filename').text(),
      info: {
        size: $('.resource-meta span.meta-item').first().text().split(/文件大小 /),
        date: $('.resource-meta span.meta-item').last().text().split(/更新时间 /)
      }
    }

    return dataset
  }

  async render ({ request, view }) {
    const wd = request.input('wd')
    var response = await superagent.get(`https://www.bd-film.cc/search.jspx?q=${ wd }`)
    const dataset = this.htmlToSearchMovieData(response)

    var response = await superagent.get(`https://www.dalipan.com/search?keyword=${ wd }`)
    const baiduyun = this.htmlToSearchBaiduyunData(response)

    return view.render('detail', { dataset, baiduyun, wd })
  }

  async source ({ request, params, view }) {
    if (request.input('p') == 'baiduyun') {
      const response = await superagent.get(`https://www.dalipan.com/detail/${ request.input('id') }`)
      const dataset = this.htmlToSearchBaiduyunSourceData(response)
      return view.render('source', { dataset })
    } else {
      const response = await superagent.get(`https://www.bd-film.cc/gq/${ request.input('id') }.htm`)
      const dataset = this.htmlToSearchMovieSourceData(response)
      return view.render('source', { dataset })
    }
  }
}

module.exports = DetailController

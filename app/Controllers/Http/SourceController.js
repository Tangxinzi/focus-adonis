'use strict'

const superagent    = use('superagent')
const cheerio       = use('cheerio')
const phantom       = use('phantom')
require('superagent-charset')(superagent)

class DetailController {
  async htmlToSearchMovieSourceData (id, type) {
    let sitepage = null
    let phInstance = null
    let dataset = null

    await phantom.create()
      .then(instance => {
        phInstance = instance
        return instance.createPage()
      })
      .then(page => {
        sitepage = page
        return page.open(`https://www.bd-film.cc/${ type }/${ id }.htm`)
      })
      .then(status => {
        return sitepage.property('content')
      })
      .then(content => {
        const $ = cheerio.load(content)
        const _content = $('.content')
        const option = $('#address .option')
        dataset = {
          p: 'source',
          title: _content.find('h3').text(),
          description: $('#plot .plot').text(),
          content: {
            attrs: _content.text().indexOf('导演: ') > 0 ? _content.text().split(/导演: /)[1].split(/编剧: /)[0] : '',
            local: _content.text().indexOf('制片国家/地区: ') > 0 ? _content.text().split(/制片国家\/地区: /)[1].split(/语言: /)[0] : '',
            runtime: _content.text().indexOf('片长: ') > 0 ? _content.text().split(/片长: /)[1].split(/又名: /)[0] : '',
            date: _content.text().indexOf('上映日期: ') > 0 ? _content.text().split(/上映日期: /)[1].split(/片长: /)[0] : '',
            screenwriter: _content.text().indexOf('编剧: ') > 0 ? _content.text().split(/编剧: /)[1].split(/主演: /)[0] : '',
            actor: _content.text().indexOf('主演: ') > 0 ? _content.text().split(/主演: /)[1].split(/类型: /)[0] : '',
            type: _content.text().indexOf('类型: ') > 0 ? _content.text().split(/类型: /)[1].split(/制片国家\/地区: /)[0] : '',
            imdb_href: _content.text().indexOf('IMDb链接: ') > 0 ? _content.text().split(/IMDb链接: /)[1] : '',
            douban: {
              count: _content.find('a.db').text(),
              href: _content.eq(0).find('a.db').attr('href')
            },
            imdb: {
              count: _content.find('a.imdb').text(),
              href: _content.find('a.imdb').attr('href')
            }
          },
          baiduyun: {
            text: option.last().find('a').text(),
            pass: option.last().children('span').text(),
            href: option.last().find('a').attr('href')
          },
          download: []
        }
        option.each((index, element) => {
          let data = {
            text: option.eq(index).children('a').text(),
            href: option.eq(index).children('a').attr('href'),
            size: option.eq(index).find('.pull-right').children('span').text(),
            label: [
              {
                color: 'green',
                text: '下载', // option.eq(index).find('.label.label-info.copybtn').text()
                href: option.eq(index).find('.label.label-info.copybtn').attr('data-clipboard-text')
              },
              {
                color: 'blue',
                text: option.eq(index).find('.label.label-info').eq(1).text(),
                href: option.eq(index).find('.label.label-info').eq(1).attr('href')
              },
              {
                color: 'yellow',
                text: option.eq(index).find('.label.label-warning').text(),
                href: option.eq(index).find('.label.label-warning').attr('href')
              }
            ]
          }
          dataset.download.push(data)
        })

        sitepage.close()
      })
      .catch(error => {
        sitepage.close()
      })

    return dataset
  }

  async htmlToPassBaiduyunSourceData (id) {
    // let sitepage = null
    // let phInstance = null
    let dataset = null

    // await phantom.create()
    //   .then(instance => {
    //     phInstance = instance
    //     return instance.createPage()
    //   })
    //   .then(page => {
    //     sitepage = page
    //     return page.open(`https://www.dalipan.com/detail/${ id }`)
    //   })
    //   .then(status => {
    //     return sitepage.property('content')
    //   })
    //   .then(content => {
    //     const $ = cheerio.load(content)
    //     // $('.baidu-button-inner a.button').click()
    //     dataset = {
    //       p: 'baiduyun',
    //       title: $('#info').find('h1.filename').text(),
    //       info: {
    //         size: $('.resource-meta span.meta-item').first().text().split(/文件大小 /)[1],
    //         date: $('.resource-meta span.meta-item').eq(1).text().split(/更新时间 /)[1]
    //       },
    //       baiduyun: {
    //         tips: $('.result-tip').text(),
    //         pass: $('.copy-item').text().split(/            点击复制/)[0],
    //         href: $('.go-baidu a').attr('href')
    //       },
    //       detail: []
    //     }
    //     const detail = $('.detail-inner-wrap .detail-item')
    //     detail.each((index, element) => {
    //       let item = detail.eq(index).text()
    //       dataset.detail.push(item)
    //     })
    //     sitepage.close()
    //   })
    //   .catch(error => {
    //     sitepage.close()
    //   })

      let sitepage = null; //创建网页对象实例
      let phInstance = null; //创建phantomj实例对象
      await phantom.create()
      .then(instance => {
          phInstance = instance;
          return instance.createPage();
      })
      .then(page => {
          sitepage = page;
          return page.open(`https://www.dalipan.com/detail/${ id }`);
      })
      .then(status => {
          console.info(status); //获取结果状态
          return sitepage.property('content'); //获取相应的属性内容
      })
      .then(content => {
          const $ = cheerio.load(content)
          console.log($('.baidu-button-inner a.button'));
          dataset = {
            p: 'baiduyun',
            title: $('#info').find('h1.filename').text(),
            info: {
              size: $('.resource-meta span.meta-item').first().text().split(/文件大小 /)[1],
              date: $('.resource-meta span.meta-item').eq(1).text().split(/更新时间 /)[1]
            },
            baiduyun: {
              tips: $('.result-tip').text(),
              pass: $('.copy-item').text().split(/            点击复制/)[0],
              href: $('.go-baidu a').attr('href')
            },
            detail: []
          }
          const detail = $('.detail-inner-wrap .detail-item')
          detail.each((index, element) => {
            let item = detail.eq(index).text()
            dataset.detail.push(item)
          })
      })
      .catch(error => {
          console.log(error);
          phInstance.exit();
      });

    return dataset
  }

  async htmlToSearchRecommendSourceData (id) {
    const response = await superagent.get(encodeURI(`http://www.hao6v.com${ id }`)).charset('gbk').buffer(true)
    const $ = cheerio.load(response.text)
    let dataset = {
      p: 'recommend',
      title: $('#main').find('h1').text(),
      description: $('#endText').text().indexOf('简　　介') > 0 ? $('#endText').text().split(/◎简　　介/)[1].split(/◎获奖情况/)[0] : '暂无简介...',
      download: []
    }
    const detail = $('#endText table tr')
    detail.each((index, element) => {
      let type = detail.eq(index).text().split(/：/)[0].replace(/[^\u4E00-\u9FA5]/g,'')
      if (type != '请勿使用迅雷') {
        let item = {
          type: type,
          text: detail.eq(index).find('a').text(),
          href: detail.eq(index).find('a').attr('href')
        }
        dataset.download.push(item)
      }
    })
    return dataset
  }

  async htmlToRelationBaiduyunSourceData (wd) {
    const response = await superagent.get(`https://www.dalipan.com/search?keyword=${ wd }`)
    const $ = cheerio.load(response.text)
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

  async render ({ request, params, view }) {
    let dataset
    switch (request.input('p')) {
      case 'baiduyun':
        dataset = await this.htmlToPassBaiduyunSourceData(request.input('id'))
        // const relation = await this.htmlToRelationBaiduyunSourceData(dataset.title)
        return { dataset }
        break;
      case 'source':
        dataset = await this.htmlToSearchMovieSourceData(request.input('id'), request.input('type'))
        return view.render('source', { dataset })
        break;
      case 'recommend':
        dataset = await this.htmlToSearchRecommendSourceData(request.input('id'))
        console.log(dataset)
        return view.render('source', { dataset })
        break;
      default:

    }
  }
}

module.exports = DetailController

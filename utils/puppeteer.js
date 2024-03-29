const vanillaPuppeteer = require('puppeteer')
const { addExtra } = require('puppeteer-extra')
const Stealth = require('puppeteer-extra-plugin-stealth')
const Recaptcha = require('puppeteer-extra-plugin-recaptcha')
const { Cluster } = require('puppeteer-cluster')
const cheerio = require('cheerio')

// HELPERS:
const { removeAfter } = require('../helpers/utils')
const dayjs = require('./dayjs').dayjsParser()
const { reverseFromNow } = require('./dayjs')

// CONTROLLERS:
const { changeDownloadingState } = require('../controllers/profile')
const Rating = require('../models/rating')

// let blockedResourceTypes = ['image', 'stylesheet', 'font'];
// let blockedNetworks = ['analytics', 'hotjar'];
const options = {
  // headless: false,
  args: [
    '--autoplay-policy=user-gesture-required',
    '--disable-background-networking',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-breakpad',
    '--disable-client-side-phishing-detection',
    '--disable-component-update',
    '--disable-default-apps',
    '--disable-dev-shm-usage',
    '--disable-domain-reliability',
    '--disable-extensions',
    '--disable-features=AudioServiceOutOfProcess',
    '--disable-hang-monitor',
    '--disable-ipc-flooding-protection',
    '--disable-notifications',
    '--disable-offer-store-unmasked-wallet-cards',
    '--disable-print-preview',
    '--disable-prompt-on-repost',
    '--disable-renderer-backgrounding',
    '--disable-setuid-sandbox',
    '--disable-speech-api',
    '--disable-sync',
    '--disable-gpu',
    '--hide-scrollbars',
    '--metrics-recording-only',
    '--mute-audio',
    '--no-default-browser-check',
    '--no-first-run',
    '--no-pings',
    '--no-sandbox',
    '--no-zygote',
    '--password-store=basic',
    '--use-gl=swiftshader',
    '--use-mock-keychain',
    '--disable-accelerated-2d-canvas',
    // '--user-agent="Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36"',
  ],
  // devtools: true,
}

exports.options = options

let cluster

const getGoogleReviews = async ({ page, url, selectedCompany }) => {
  try {
    await page.waitForNetworkIdle()
    await page.click('button[jsaction*=moreReviews]')

    const scrollableDiv = 'div[role=main] > div:nth-child(2)'

    let previous = 0
    let loadMore = true

    while (loadMore) {
      await page.waitForNetworkIdle()

      const scrollHeight = await page.evaluate((selector) => {
        // eslint-disable-next-line no-undef
        const scrollableSection = document.querySelector(selector)

        scrollableSection.scrollTop = scrollableSection.scrollHeight
        return scrollableSection.scrollHeight
      }, scrollableDiv)

      console.log(
        `Google scrolling previous: ${previous} current: ${scrollHeight}`
      )

      if (previous !== scrollHeight) {
        previous = scrollHeight
      } else {
        loadMore = false
      }
    }

    await page.evaluate(() => {
      // eslint-disable-next-line no-undef
      const expand = document.querySelectorAll(
        'button[jsaction="pane.review.expandReview"]'
      )

      if (expand.length) {
        expand.forEach((el) => el.click())
      }
    })

    const result = await page.content()
    const $ = cheerio.load(result)

    const items = []

    await $('div[data-review-id][data-js-log-root]').map((index, el) => {
      const $el = cheerio.load(el)

      $el.prototype.count = function (selector) {
        return this.find(selector).length
      }
      $el.prototype.exists = function (selector) {
        return this.find(selector).length > 0
      }
      const object = {
        company: selectedCompany,
        url,
        image: $el('img').attr('src'),
        type: 'google',
        name: $el('a[target=_blank]>div:first-child>span').text(),
        description: removeAfter(
          $el('span[jsan*=-text]').text().trim(),
          '(Original)'
        ),
      }

      if ($el(el).exists('span[aria-label*=stars]')) {
        object.date = reverseFromNow(
          $el('span[aria-label*=stars] + span').text().trim()
        )
        object.rating = parseInt(
          $el('span[aria-label*=stars]').attr('aria-label').trim('').charAt(0),
          10
        )
      }

      if (
        $el(el).exists('div[class*=-text]') &&
        $el('div[class*=-text]').text().trim()
      ) {
        object.reply = {
          text: removeAfter(
            $el('div[class*=-text]').text().trim(),
            '(Original)'
          ),
        }
      }

      items.push(object)
    })
    console.log(items)

    return items
  } catch (err) {
    console.log(err)
    return []
  }
}

const getBokadirektReviews = async ({ page, url, selectedCompany }) => {
  try {
    await page.click('button.view-all-reviews')
    await page.waitForNetworkIdle()

    const loadMore = async () => {
      await page.click('.modal-content button.view-all-reviews')
      await page.waitForNetworkIdle()

      if (await page.$('.modal-content button.view-all-reviews')) {
        await loadMore()
      }
    }
    if (await page.$('.modal-content button.view-all-reviews')) {
      await loadMore()
    }

    const result = await page.content()

    const $ = cheerio.load(result)

    const items = []
    await $('.modal-content div[itemprop=review]').map((index, el) => {
      const $el = cheerio.load(el)

      const object = {
        company: selectedCompany,
        type: 'bokadirekt',
        url,
        image: `https://www.bokadirekt.se${$el('.review-user img').attr(
          'src'
        )}`,
        name: $el('span[itemprop=name]').text(),
        rating: Number($el('meta[itemprop=ratingValue]').attr('content')),
        description: $el('div.review-text').text(),
        date: dayjs($el('time[datetime]').attr('datetime'), 'YYYY-MM-DD'),
      }

      items.push(object)
    })

    return items
  } catch (err) {
    console.log(err)
    return []
  }
}

const getHittaReviews = async ({ page, url, selectedCompany }) => {
  try {
    await page.waitForNetworkIdle()

    const result = await page.content()
    const $ = cheerio.load(result)

    const items = []
    await $('div.section-block--review').map((index, el) => {
      const $el = cheerio.load(el)

      $el.prototype.count = function (selector) {
        return this.find(selector).length
      }
      const object = {
        company: selectedCompany,
        type: 'hitta',
        url,
        name: $el('div.section-block--review_meta h4').text(),
        description: $el('div.section-block--review_comment p').text(),
        date: new Date(),
      }
      const reviewEl = $el('div.widget-header_rating-svg_container > div').attr(
        'style'
      )
      if (reviewEl) {
        object.rating =
          parseInt(
            reviewEl.slice(
              reviewEl.indexOf(' ') + 1,
              reviewEl.lastIndexOf('%')
            ),
            10
          ) / 20
      }

      items.push(object)
    })

    return items
  } catch (err) {
    console.log(err)
    return []
  }
}

const getFreshaReviews = async ({ page, url, selectedCompany }) => {
  try {
    await page.waitForNetworkIdle()
    if (await page.$('button[data-qa=cookie-accept-btn]')) {
      await page.click('button[data-qa=cookie-accept-btn]')
    }

    const loadMore = async () => {
      await page.click('div[data-qa=reviews-list] button')
      await page.waitForNetworkIdle()

      if (await page.$('div[data-qa=reviews-list] button')) {
        await loadMore()
      }
    }
    if (await page.$('div[data-qa=reviews-list] button')) {
      await loadMore()
    }

    const result = await page.content()
    const $ = cheerio.load(result)

    const items = []
    await $('div[data-qa=reviews-list] li').map((index, el) => {
      const $el = cheerio.load(el)

      $el.prototype.count = function (selector) {
        return this.find(selector).length
      }
      const object = {
        company: selectedCompany,
        type: 'fresha',
        url,
        name: $el('p[data-qa=review-user-name]').text(),
        rating: Number(
          $el('div[data-qa=review-rating]').count('div[type=selected]')
        ),
        description: $el('p[class*=StyledParagraph]').text(),
        date: dayjs($el('p[data-qa=review-appt-date]').text(), 'MMM D, YYYY'),
      }

      items.push(object)
    })

    return items
  } catch (err) {
    console.log(err)
    return []
  }
}

const getTrustpilotReviews = async ({ page, url, selectedCompany }) => {
  try {
    // const showAllReviews = await page.$('a[name=show-all-reviews]');
    // if (showAllReviews) {
    //   // await page.click('a[name=show-all-reviews]')
    //   await showAllReviews.evaluate(b => b.click());
    //   await page.waitForNetworkIdle()
    // }
    await page.goto(page.url() + "?languages=all")

    const items = []
    let result = await page.content()

    const loadReviews = async (items, result) => {
      const $ = cheerio.load(result)

      await $('article[class*=reviewCard]').map((index, el) => {
        const $el = cheerio.load(el)

        $el.prototype.exists = function (selector) {
          return this.find(selector).length > 0
        }
        const object = {
          company: selectedCompany,
          type: 'trustpilot',
          url,
          name: $el('[data-consumer-name-typography]').text(),
          rating: Number(
            $el('div[data-service-review-rating]').attr(
              'data-service-review-rating'
            )
          ),
          title: $el('h2[data-service-review-title-typography]').text(),
          description: $el('p[data-service-review-text-typography]').html(),
          date: $el('time[datetime]').attr('datetime'),
        }

        if ($el(el).exists('div[class*=replyInfo]')) {
          object.reply = {
            text: $el('div[class*=replyInfo] ~ p').html(),
          }
        }
        if ($el(el).exists('noscript')) {
          const noscript = $el('noscript').text()
          const image = noscript.split('src="').pop().split('"')[0].trim()
          if (image) {
            object.image = image
          }
        }

        items.push(object)
      })
    }

    await loadReviews(items, result)

    if (await page.$('button[id=onetrust-accept-btn-handler]')) {
      page.click('button[id=onetrust-accept-btn-handler]')
    }

    // const loadMore = async () => {
    //   await page.evaluate(() => {
    //     // eslint-disable-next-line no-undef
    //     const nextEl = document.querySelector('a[name=pagination-button-next]')
    //     if (nextEl) nextEl.click()
    //   })
    //   await page.waitForNetworkIdle()

    //   result = await page.content()
    //   await loadReviews(items, result)

    //   if (await page.$('a[name=pagination-button-next]:not([aria-disabled=true])')) {
    //     await loadMore()
    //   }
    // }
    // if (await page.$('a[name=pagination-button-next]:not([aria-disabled=true])')) {
    //   await loadMore()
    // }

    return items
  } catch (err) {
    console.log(err)
    return []
  }
}

const getRecoseReviews = async ({ page, url, selectedCompany }) => {
  try {
    await page.evaluate(async () => {
      async function waitUntil() {
        return new Promise((resolve) => {
          let interval = setInterval(() => {
            // eslint-disable-next-line no-undef
            const button = document.querySelector('a.more-reviews-button')
            if (button) {
              button.click()
            } else {
              resolve()
              clearInterval(interval)
              interval = null
            }
          }, 50)
        })
      }
      await waitUntil()
    })

    console.log('Done with awaiting')

    const result = await page.content()
    const $ = cheerio.load(result)

    const items = []
    await $('.review-card').map((index, el) => {
      const $el = cheerio.load(el)

      $el.prototype.count = function (selector) {
        return this.find(selector).length
      }
      $el.prototype.exists = function (selector) {
        return this.find(selector).length > 0
      }

      const object = {
        company: selectedCompany,
        type: 'recose',
        url,
        name: $el('.review-card--reviewer-person-info a').text(),
        rating: Number($el('div.reco-rating.rxs.iblock').count('span')),
        description: $el('div.text-clamp--inner q').html(),
        date: dayjs($el('.submit-date').text(), 'YYYY-MM-DD'),
      }

      if ($el(el).exists('.review-card--response')) {
        object.reply = { text: $el('.review-card--response q').html() }
      }

      if ($el(el).exists('img.js--lazy-load')) {
        object.image = $el('img.js--lazy-load').attr('src').trim()
      } else
        object.image =
          'https://www.reco.se/assets/images/icons/default-user.svg'

      items.push(object)
    })
    console.log('RECO Review Cards', items.length)

    return items
  } catch (err) {
    console.log(err)
    return []
  }
}

const getBookingReviews = async ({ page, url, selectedCompany }) => {
  try {
    await page.click('a[rel=reviews][role=button]')
    await page.waitForNetworkIdle()

    const items = []
    let result = await page.content()

    const loadReviews = async (items, result) => {
      const $ = cheerio.load(result)

      await $('div[itemprop=review]').map((index, el) => {
        const $el = cheerio.load(el)

        const date = $el('.c-review-block__right .c-review-block__date')
          .text()
          .replace('Reviewed:', '')
          .trim()

        let format = ''
        if (dayjs(date, 'MMMM D, YYYY').isValid()) {
          format = 'MMMM D, YYYY'
        } else if (dayjs(date, 'D MMMM YYYY').isValid()) {
          format = 'D MMMM YYYY'
        } else if (dayjs(date, 'D. MMMM YYYY.').isValid()) {
          format = 'D. MMMM YYYY.'
        }

        $el.prototype.exists = function (selector) {
          return this.find(selector).length > 0
        }
        const object = {
          company: selectedCompany,
          type: 'booking',
          url,
          image: $el('.bui-avatar__image').attr('src'),
          name: $el('.bui-avatar-block__title').text(),
          rating:
            Number(
              $el('.bui-review-score__badge').text().trim().replace(',', '.')
            ) / 2,
          title: $el('.c-review-block__title').text().trim(),
          description: $el('.c-review__body').text().trim(),
          date: dayjs(date, format),
        }

        if ($el(el).exists('.c-review-block__response')) {
          object.reply = {
            text: $el('.c-review-block__response__inner').text(),
          }
        }

        items.push(object)
      })
    }

    await loadReviews(items, result)

    const loadMore = async () => {
      await page.click('.bui-pagination__next-arrow')
      await page.waitForNetworkIdle()

      result = await page.content()
      await loadReviews(items, result)

      if (
        await page.$(
          '.bui-pagination__next-arrow:not(.bui-pagination__item--disabled)'
        )
      ) {
        await loadMore()
      }
    }
    if (
      await page.$(
        '.bui-pagination__next-arrow:not(.bui-pagination__item--disabled)'
      )
    ) {
      await loadMore()
    }

    return items
  } catch (err) {
    console.log(err)
    return []
  }
}

// const getAirbnbReviews = async ({ page, url, selectedCompany }) => {
// 	try {
// 		await page.waitForNetworkIdle();
// 		await page.click('a[data-testid=pdp-show-all-reviews-button]');

// const items = [];
// let result = await page.content();

// const loadReviews = async (items, result) => {
// 	const $ = cheerio.load(result);

// 	await $('div[itemprop=review]').map((index, el) => {
// 		const $el = cheerio.load(el);

// 		const date = $el('.c-review-block__right .c-review-block__date').text().replace('Reviewed:', '').trim();

// 		let format = '';
// 		if (dayjs(date, 'MMMM D, YYYY').isValid()) {
// 			format = 'MMMM D, YYYY';
// 		} else if (dayjs(date, 'D MMMM YYYY').isValid()) {
// 			format = 'D MMMM YYYY';
// 		} else if (dayjs(date, 'D. MMMM YYYY.').isValid()) {
// 			format = 'D. MMMM YYYY.';
// 		}

// 		$el.prototype.exists = function (selector) {
// 			return this.find(selector).length > 0;
// 		};
// 		const object = {
// 			company: selectedCompany,
// 			type: 'booking',
// 			url,
// 			name: $el('.bui-avatar-block__title').text(),
// 			rating: Number($el('.bui-review-score__badge').text().trim().replace(',', '.')) / 2,
// 			title: $el('.c-review-block__title').text().trim(),
// 			description: $el('.c-review__body').text().trim(),
// 			date: dayjs(date, format),
// 		};

// 		if ($el(el).exists('.c-review-block__response')) {
// 			object.reply = { text: $el('.c-review-block__response__inner').text() };
// 		}

// 		items.push(object);
// 	});
// };

// await loadReviews(items, result);

// const loadMore = async () => {
// 	await page.click('.bui-pagination__next-arrow');
// 	await page.waitForNetworkIdle();

// 	result = await page.content();
// 	await loadReviews(items, result);

// 	if (await page.$('.bui-pagination__next-arrow:not(.bui-pagination__item--disabled)')) {
// 		await loadMore();
// 	}
// };
// if (await page.$('.bui-pagination__next-arrow:not(.bui-pagination__item--disabled)')) {
// 	await loadMore();
// }

// 		return items;
// 	} catch (err) {
// 		console.log(err);
// 		return [];
// 	}
// };

exports.getCluster = async () => {
  if (!cluster) {
    const puppeteer = addExtra(vanillaPuppeteer)
    puppeteer.use(Stealth())
    puppeteer.use(Recaptcha())

    cluster = await Cluster.launch({
      puppeteer: puppeteer,
      concurrency: Cluster.CONCURRENCY_CONTEXT,
      maxConcurrency: 4,
      puppeteerOptions: options,
      timeout: 1_800_000,
      retryLimit: 1,
      retryDelay: 1000,
      sameDomainDelay: 3000,
      workerCreationDelay: 100,
    })
  }

  await cluster.task(async ({ page, data }) => {
    const { url, type, selectedCompany } = data
    await changeDownloadingState(selectedCompany, type, true)

    console.log(`[N/A] Cluster Fetching [${type}] Reviews From URL: ${url}`)
    await page.goto(url)
    // const version = await page.browser().version();
    // console.log('Browser Version' + version);

    let items

    switch (type) {
      case 'google':
        items = await getGoogleReviews({
          page,
          url,
          selectedCompany,
        })
        break
      case 'bokadirekt':
        items = await getBokadirektReviews({
          page,
          url,
          selectedCompany,
        })
        break
      case 'fresha':
        items = await getFreshaReviews({
          page,
          url,
          selectedCompany,
        })
        break
      case 'trustpilot':
        items = await getTrustpilotReviews({
          page,
          url,
          selectedCompany,
        })
        break
      case 'recose':
        items = await getRecoseReviews({
          page,
          url,
          selectedCompany,
        })
        break
      case 'hitta':
        items = await getHittaReviews({
          page,
          url,
          selectedCompany,
        })
        break
      case 'booking':
        items = await getBookingReviews({
          page,
          url,
          selectedCompany,
        })
        break
      // case 'airbnb':
      // 	items = await getAirbnbReviews({
      // 		page,
      // 		url,
      // 		selectedCompany,
      // 	});
      // 	break;
      default:
        break
    }

    if (items.length) {
      console.log(`LOADED REVIEWS:${items.length}`)
      items = items.filter((item) => item.name && item.rating && item.date)
      console.log(`VALID REVIEWS:${items.length}`)

      await Rating.insertMany(items)

      await changeDownloadingState(selectedCompany, type, false)
    } else {
      await changeDownloadingState(selectedCompany, type, false)
    }
  })

  return cluster
}

module.exports = ({ content, button, color, logo, plan }) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Trustbucket Campaign</title>
    <style>
      p {
        margin: 0;
        min-height: 22px;
      }
      h2,
      h3,
      h4,
      h5,
      h6 {
        margin-bottom: 0px;
        min-height: 22px;
      }
    </style>
  </head>
  <body style="background: #fff">
    <table
      role="presentation"
      cellpadding="0"
      cellspacing="0"
      style="
        border-spacing: 0 !important;
        border-collapse: collapse;
        margin: 0;
        padding: 0;
        width: 100% !important;
        min-width: 320px !important;
        height: 100% !important;
        max-width: 600px;
        margin: 0 auto;
      "
      width="100%"
      height="100%"
    >
      <tbody>
        <tr>
          <td
            valign="top"
            style="
              border-collapse: collapse;
              font-family: Arial, sans-serif;
              font-size: 15px;
              color: #222d38;
              word-break: break-word;
            "
          >
            <div
              id="m_-5072298247928332435hs_cos_wrapper_main"
              style="color: inherit; font-size: inherit; line-height: inherit"
            >
              <div>
                <div
                  id="m_-5072298247928332435section-0"
                  class="m_-5072298247928332435hse-section"
                  style="
                    padding-left: 10px;
                    padding-right: 10px;
                    padding-top: 20px;
                  "
                >
                  <div
                    class="m_-5072298247928332435hse-column-container"
                    style="
                      min-width: 280px;
                      max-width: 600px;
                      width: 100%;
                      margin-left: auto;
                      margin-right: auto;
                      border-collapse: collapse;
                      border-spacing: 0;
                      background-color: #ffffff;
                      padding-bottom: 20px;
                      padding-top: 20px;
                    "
                    bgcolor="#ffffff"
                  >
                    <div
                      id="m_-5072298247928332435column-0-0"
                      class="m_-5072298247928332435hse-column m_-5072298247928332435hse-size-12"
                    >
                      <div
                        id="m_-5072298247928332435hs_cos_wrapper_module-0-0-0"
                        style="
                          color: inherit;
                          font-size: inherit;
                          line-height: inherit;
                        "
                      >
                        ${
                          plan === 'free'
                            ? `<table
                          role="presentation"
                          width="100%"
                          cellpadding="0"
                          cellspacing="0"
                          style="
                            border-spacing: 0 !important;
                            border-collapse: collapse;
                          "
                        >
                          <tbody>
                            <tr>
                              <td
                                align="left"
                                valign="top"
                                style="
                                  border-collapse: collapse;
                                  font-family: Arial, sans-serif;
                                  font-weight: 400;
                                  font-size: 12px;
                                  line-height: 15px;
                                  padding: 0 20px;
                                "
                              >
                                <a
                                  style="
                                    padding: 10px 0 4px;
                                    border-top: 1px solid #d6dae4;
                                    border-bottom: 1px solid #d6dae4;
                                    color: #99adc1;
                                    text-decoration: none;
                                    width: 100%;
                                    display: block;
                                  "
                                  target="_blank"
                                  href="https://trustbucket.io/"
                                  data-saferedirecturl="https://trustbucket.io/"
                                >
                                  Powered by
                                  <img
                                    alt="Trustbucket"
                                    src="http://trustbucket.io/wp-content/uploads/2022/06/Group-58-2.png"
                                    style="
                                      margin-bottom: 6px;
                                      margin-left: 8px;
                                      width: 100px;
                                    "
                                    align="middle"
                                    class="CToWUd"
                                  />
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>`
                            : ''
                        }
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  id="m_-5072298247928332435section-1"
                  class="m_-5072298247928332435hse-section"
                  style="padding-left: 10px; padding-right: 10px"
                >
                  <div
                    class="m_-5072298247928332435hse-column-container"
                    style="
                      min-width: 280px;
                      max-width: 600px;
                      width: 100%;
                      margin-left: auto;
                      margin-right: auto;
                      border-collapse: collapse;
                      border-spacing: 0;
                      background-color: #ffffff;
                      padding-bottom: 15px;
                    "
                    bgcolor="#ffffff"
                  >
                    <div
                      id="m_-5072298247928332435column-1-0"
                      class="m_-5072298247928332435hse-column m_-5072298247928332435hse-size-12"
                    >
                      <table
                        role="presentation"
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        style="
                          border-spacing: 0 !important;
                          border-collapse: collapse;
                        "
                      >
                        <tbody>
                        ${
                          logo
                            ? `<tr>
                              <td
                                style="
                                border-collapse: collapse;
                                font-family: Arial, sans-serif;
                                font-size: 15px;
                                color: #222d38;
                                word-break: break-word;
                                padding: 0px 20px 30px;
                              "
                              >
                                <img
                                  style="
                                  width: 124px;
                                  height: 32px;
                                  object-fit: contain;
                                "
                                  alt="Logo"
                                  src="${logo.replace(' ', '%20')}"
                                />
                              </td>
                            </tr>`
                            : ''
                        }
                          <tr>
                            <td
                              class="m_-5072298247928332435hs_padded"
                              style="
                                border-collapse: collapse;
                                font-family: Arial, sans-serif;
                                font-size: 15px;
                                color: #222d38;
                                word-break: break-word;
                                padding: 0px 20px 10px;
                              "
                            >
                              <div
                                id="m_-5072298247928332435hs_cos_wrapper_module-1-0-0"
                                style="
                                  color: inherit;
                                  font-size: inherit;
                                  line-height: inherit;
                                "
                              >
                                <div
                                  id="m_-5072298247928332435hs_cos_wrapper_module-1-0-0_"
                                  style="
                                    color: inherit;
                                    font-size: inherit;
                                    line-height: inherit;
                                  "
                                >
                                  <div
                                    style="line-height: 175%; text-align: left"
                                    align="left"
                                  >
                                    ${content}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                ${
                  button
                    ? `
                <div
                  id="m_-5072298247928332435section-2"
                  class="m_-5072298247928332435hse-section"
                  style="padding-left: 10px; padding-right: 10px"
                >
                  <div
                    class="m_-5072298247928332435hse-column-container"
                    style="
                      min-width: 280px;
                      max-width: 600px;
                      width: 100%;
                      margin-left: auto;
                      margin-right: auto;
                      border-collapse: collapse;
                      border-spacing: 0;
                      background-color: #ffffff;
                      padding-bottom: 15px;
                    "
                    bgcolor="#ffffff"
                  >
                    <div
                      id="m_-5072298247928332435column-2-0"
                      class="m_-5072298247928332435hse-column m_-5072298247928332435hse-size-12"
                    >
                      <table
                        role="presentation"
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        style="
                          border-spacing: 0 !important;
                          border-collapse: collapse;
                        "
                      >
                        <tbody>
                          <tr>
                            <td
                              class="m_-5072298247928332435hs_padded"
                              style="
                                border-collapse: collapse;
                                font-family: Arial, sans-serif;
                                font-size: 15px;
                                color: #222d38;
                                word-break: break-word;
                                padding: 10px 20px;
                              "
                            >
                              <div
                                id="m_-5072298247928332435hs_cos_wrapper_module-2-0-0"
                                style="
                                  color: inherit;
                                  font-size: inherit;
                                  line-height: inherit;
                                "
                              >
                                <table
                                  width="100%"
                                  align="center"
                                  border="0"
                                  cellpadding="0"
                                  cellspacing="0"
                                  role="presentation"
                                  style="
                                    border-spacing: 0 !important;
                                    border-collapse: separate !important;
                                  "
                                >
                                  <tbody>
                                    <tr>
                                      <td
                                        align="center"
                                        valign="middle"
                                        bgcolor="${color ? color : '#2563EB'}"
                                        role="presentation"
                                        style="
                                          border-collapse: collapse;
                                          font-family: Arial, sans-serif;
                                          font-size: 15px;
                                          color: #222d38;
                                          word-break: break-word;
                                          border-radius: 3px;
                                          background-color: ${
                                            color ? color : '#2563EB'
                                          };
                                        "
                                      >
                                        <a
                                          href="${button.url}"
                                          style="
                                            color: #00a4bd;
                                            font-size: 16px;
                                            font-family: Tahoma, sans-serif;
                                            margin: 0;
                                            text-transform: none;
                                            text-decoration: none;
                                            padding: 16px;
                                            display: block;
                                          "
                                          target="_blank"
                                          data-saferedirecturl="${button.url}"
                                        >
                                          <strong
                                            style="
                                              color: #ffffff;
                                              font-weight: normal;
                                              text-decoration: none;
                                              font-style: normal;
                                            "
                                            >${button.text}</strong
                                          >
                                        </a>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                `
                    : ''
                }
                <div
                  style="
                    text-align: left;
                    padding-bottom: 20px;
                    padding-top: 10px;
                    margin: 0 40px;
                    border-top: 1px solid #99adc1;
                  "
                >
                  <p style="font-size: 13px; line-height: 32px; color: #99adc1">
                    Note: If you want to stop receiving review invitation
                    emails, please click
                    <a
                      style="color: #99adc1"
                      href="[[UNSUB_LINK]]"
                      target="_blank"
                      rel="noopener noreferrer"
                      >unsubscribe.</a
                    >
                  </p>
                </div>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>

    `

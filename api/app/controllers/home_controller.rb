class HomeController < ActionController::Base
  protect_from_forgery with: :null_session

  def index
    @app_url = ENV.fetch("EXPO_APP_URL", nil)
    render html: landing_html.html_safe, layout: false
  end

  private

  def landing_html
    <<~HTML
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Shop-o-matic</title>
        <style>
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #F2F2F7;
            min-height: 100dvh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
          }

          .card {
            background: #FFFFFF;
            border-radius: 20px;
            padding: 48px 40px;
            max-width: 400px;
            width: 100%;
            text-align: center;
            box-shadow: 0 2px 20px rgba(0,0,0,0.08);
          }

          .icon {
            font-size: 72px;
            line-height: 1;
            margin-bottom: 20px;
          }

          h1 {
            font-size: 34px;
            font-weight: 700;
            color: #1C1C1E;
            letter-spacing: -0.5px;
            margin-bottom: 8px;
          }

          .tagline {
            font-size: 17px;
            color: #8E8E93;
            margin-bottom: 40px;
            line-height: 1.4;
          }

          .btn {
            display: inline-block;
            background: #007AFF;
            color: #FFFFFF;
            font-size: 17px;
            font-weight: 600;
            text-decoration: none;
            padding: 14px 36px;
            border-radius: 12px;
            transition: opacity 0.15s;
          }

          .btn:hover { opacity: 0.85; }

          .app-url {
            margin-top: 16px;
            font-size: 13px;
            color: #C7C7CC;
            word-break: break-all;
          }

          .no-link {
            font-size: 15px;
            color: #C7C7CC;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">🛒</div>
          <h1>Shop-o-matic</h1>
          <p class="tagline">The smart household shopping list</p>
          #{app_url_block}
        </div>
      </body>
      </html>
    HTML
  end

  def app_url_block
    if @app_url.present?
      <<~HTML
        <a href="#{ERB::Util.html_escape(@app_url)}" class="btn">Get the App</a>
        <p class="app-url">#{ERB::Util.html_escape(@app_url)}</p>
      HTML
    else
      '<p class="no-link">Run <code>make build-web</code> to build the app.</p>'
    end
  end
end

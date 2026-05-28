require "rqrcode"

class HomeController < ActionController::Base
  protect_from_forgery with: :null_session

  VERSION_HASH = begin
    ENV.fetch("GIT_COMMIT") do
      `git rev-parse --short HEAD 2>/dev/null`.strip.presence || "unknown"
    end
  end.freeze

  def index
    expo_url = ENV.fetch("EXPO_APP_URL") do
      host = request.host
      port = request.port
      standard_port = request.ssl? ? 443 : 80
      port == standard_port ? "exp://#{host}" : "exp://#{host}:#{port}"
    end

    qr_svg = RQRCode::QRCode.new(expo_url).as_svg(
      color: "1C1C1E",
      shape_rendering: "crispEdges",
      module_size: 6,
      standalone: true,
      use_path: true
    )

    render html: landing_html(expo_url, qr_svg, VERSION_HASH).html_safe, layout: false
  end

  private

  def landing_html(expo_url, qr_svg, version)
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

          h1 {
            font-size: 28px;
            font-weight: 700;
            color: #1C1C1E;
            letter-spacing: -0.5px;
            margin-bottom: 6px;
          }

          .tagline {
            font-size: 15px;
            color: #8E8E93;
            margin-bottom: 32px;
          }

          .qr {
            display: flex;
            justify-content: center;
            margin-bottom: 20px;
          }

          .qr svg {
            border-radius: 12px;
          }

          .expo-url {
            font-size: 13px;
            color: #8E8E93;
            word-break: break-all;
          }

          .hint {
            margin-top: 12px;
            font-size: 13px;
            color: #C7C7CC;
          }

          .version {
            margin-top: 20px;
            font-size: 11px;
            color: #C7C7CC;
            font-family: ui-monospace, "SF Mono", Menlo, monospace;
            letter-spacing: 0.3px;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Shop-o-matic</h1>
          <p class="tagline">Scan with Expo Go to open the app</p>
          <div class="qr">#{qr_svg}</div>
          <p class="expo-url">#{ERB::Util.html_escape(expo_url)}</p>
          <p class="hint">Open Expo Go &rarr; scan this code</p>
          <p class="version">#{ERB::Util.html_escape(version)}</p>
        </div>
      </body>
      </html>
    HTML
  end
end

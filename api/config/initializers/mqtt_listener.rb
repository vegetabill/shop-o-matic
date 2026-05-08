require 'mqtt'

mqtt_host  = ENV['MQTT_HOST']
mqtt_port  = ENV.fetch('MQTT_PORT', 1883).to_i
mqtt_topic = ENV.fetch('MQTT_TOPIC', 'shop-o-matic/#')
mqtt_user  = ENV['MQTT_USERNAME']
mqtt_pass  = ENV['MQTT_PASSWORD']

unless mqtt_host
  Rails.logger.info "[MQTT] MQTT_HOST not set, listener disabled"
  return
end

Thread.new do
  begin
    connect_opts = { host: mqtt_host, port: mqtt_port, connect_timeout: 5, version: :mqtt311 }
    connect_opts[:username] = mqtt_user if mqtt_user.present?
    connect_opts[:password] = mqtt_pass if mqtt_pass.present?

    MQTT::Client.connect(**connect_opts) do |client|
      Rails.logger.info "[MQTT] Connected to #{mqtt_host}:#{mqtt_port}, subscribed to '#{mqtt_topic}'"
      client.get(mqtt_topic) do |topic, message|
        Rails.logger.info "[MQTT] #{topic}: #{message}"
        MqttItemHandler.call(message)
      end
    end
  rescue StandardError => e
    Rails.logger.error "[MQTT] Listener error: #{e.class}: #{e.message}"
  end
end

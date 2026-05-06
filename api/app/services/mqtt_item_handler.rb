class MqttItemHandler
  def self.call(payload)
    data = JSON.parse(payload, symbolize_names: true)
    return unless data[:action] == 'add'

    item_name = data[:item].to_s.strip
    return if item_name.blank?

    household = Household.find_by!(share_token: data[:household_id])

    item = household.items.find_by('LOWER(name) = LOWER(?)', item_name)
    if item
      item.add_to_list!
    else
      household.items.create!(name: item_name, on_list: true)
    end

    Rails.logger.info "[MQTT] Added '#{item_name}' to list for household #{household.id}"
  rescue JSON::ParserError => e
    Rails.logger.error "[MQTT] Invalid JSON payload: #{e.message}"
  rescue ActiveRecord::RecordNotFound
    Rails.logger.error "[MQTT] Household not found: #{data&.dig(:household_id)}"
  rescue StandardError => e
    Rails.logger.error "[MQTT] Handler error: #{e.class}: #{e.message}"
  end
end

class ShortenHouseholdShareTokens < ActiveRecord::Migration[8.0]
  ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'.chars.freeze

  def up
    Household.find_each do |household|
      loop do
        code = Array.new(6) { ALPHABET.sample }.join
        unless Household.where.not(id: household.id).exists?(share_token: code)
          household.update_column(:share_token, code)
          break
        end
      end
    end
  end

  def down
    # Original UUIDs are not recoverable
  end
end

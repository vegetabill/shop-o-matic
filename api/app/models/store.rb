class Store < ApplicationRecord
  belongs_to :household
  has_many :item_stores, dependent: :destroy
  has_many :items, through: :item_stores

  validates :name, presence: true, uniqueness: { scope: :household_id, case_sensitive: false }
  validates :color, presence: true, format: { with: /\A#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})\z/, message: "must be a valid hex color (e.g. #4CAF50)" }
end

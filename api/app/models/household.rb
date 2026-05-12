class Household < ApplicationRecord
  has_many :household_memberships, dependent: :destroy
  has_many :users, through: :household_memberships
  has_many :stores, dependent: :destroy
  has_many :categories, dependent: :destroy
  has_many :items, dependent: :destroy
  has_many :shopping_trips, dependent: :destroy

  validates :name, presence: true
  validates :share_token, presence: true, uniqueness: true

  before_validation :generate_share_token, on: :create

  SHARE_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'.chars.freeze
  SHARE_CODE_LENGTH = 6

  def seed_defaults!
    # Create default store
    stores.find_or_create_by!(name: "Grocery Store") do |store|
      store.color = "#4CAF50"
    end

    # Create default categories
    default_category_names.each do |cat_name|
      categories.find_or_create_by!(name: cat_name)
    end
  end

  private

  def generate_share_token
    return if share_token.present?
    loop do
      code = Array.new(SHARE_CODE_LENGTH) { SHARE_CODE_ALPHABET.sample }.join
      self.share_token = code
      break unless Household.exists?(share_token: code)
    end
  end

  def default_category_names
    [
      "Produce",
      "Dairy Case",
      "Meat & Seafood",
      "Frozen",
      "Bakery",
      "Snacks",
      "Beverages",
      "Canned Goods",
      "Dry Goods & Pasta",
      "Condiments & Spices",
      "Breakfast",
      "Personal Care",
      "Cleaning Supplies",
      "Other"
    ]
  end
end

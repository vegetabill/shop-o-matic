class Category < ApplicationRecord
  belongs_to :household
  has_many :items, dependent: :nullify

  validates :name, presence: true, uniqueness: { scope: :household_id, case_sensitive: false }
end

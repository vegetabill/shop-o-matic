class ShoppingTripItem < ApplicationRecord
  belongs_to :shopping_trip
  belongs_to :item

  STATUSES = %w[purchased skipped].freeze
  validates :status, inclusion: { in: STATUSES }

  scope :purchased, -> { where(status: "purchased") }
  scope :skipped,   -> { where(status: "skipped") }
end

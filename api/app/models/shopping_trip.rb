class ShoppingTrip < ApplicationRecord
  belongs_to :household
  belongs_to :store, optional: true
  has_many :shopping_trip_items, dependent: :destroy
end

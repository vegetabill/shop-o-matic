class ItemStore < ApplicationRecord
  belongs_to :item
  belongs_to :store

  validates :item_id, uniqueness: { scope: :store_id, message: "is already associated with this store" }
end

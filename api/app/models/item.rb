class Item < ApplicationRecord
  belongs_to :household
  belongs_to :category, optional: true
  belongs_to :added_by_user, class_name: "User", foreign_key: :added_by_user_id, optional: true
  belongs_to :updated_by_user, class_name: "User", foreign_key: :updated_by_user_id, optional: true
  has_many :item_stores, dependent: :destroy
  has_many :stores, through: :item_stores

  PRIORITIES = %w[none low high].freeze

  validates :name, presence: true
  validates :priority, inclusion: { in: PRIORITIES }

  scope :on_list, -> { where(on_list: true) }
  scope :search, ->(q) { where("name ILIKE ?", "%#{sanitize_sql_like(q)}%") }

  def add_to_list!
    update!(on_list: true)
  end

  def purchase!
    update!(purchased_at: Time.current)
  end

  def unpurchase!
    update!(purchased_at: nil)
  end

  def mark_unavailable!
    update!(on_list: false, purchased_at: nil)
  end

  def complete_shopping!
    update!(on_list: false, purchased_at: nil)
  end
end

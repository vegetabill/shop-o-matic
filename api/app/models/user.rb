class User < ApplicationRecord
  has_many :household_memberships, dependent: :destroy
  has_many :households, through: :household_memberships
  has_many :added_items, class_name: "Item", foreign_key: :added_by_user_id, dependent: :nullify
  has_many :updated_items, class_name: "Item", foreign_key: :updated_by_user_id, dependent: :nullify

  validates :email, presence: true, uniqueness: { case_sensitive: false }, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :name, presence: true
  validates :auth0_uid, presence: true, uniqueness: true

  before_validation :normalize_email

  private

  def normalize_email
    self.email = email.to_s.downcase.strip
  end
end

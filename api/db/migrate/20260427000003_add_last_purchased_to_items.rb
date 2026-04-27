class AddLastPurchasedToItems < ActiveRecord::Migration[8.0]
  def change
    add_column :items, :last_purchased_at, :datetime
    add_reference :items, :last_purchased_store, foreign_key: { to_table: :stores }, null: true
  end
end

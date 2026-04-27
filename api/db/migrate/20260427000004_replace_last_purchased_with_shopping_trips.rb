class ReplaceLastPurchasedWithShoppingTrips < ActiveRecord::Migration[8.0]
  def change
    # Remove the single-field approach from the previous migration
    remove_reference :items, :last_purchased_store, foreign_key: { to_table: :stores }
    remove_column :items, :last_purchased_at, :datetime

    create_table :shopping_trips do |t|
      t.references :household, null: false, foreign_key: true
      t.references :store, null: true, foreign_key: true
      t.datetime :completed_at, null: false
      t.timestamps
    end

    create_table :shopping_trip_items do |t|
      t.references :shopping_trip, null: false, foreign_key: true
      t.references :item, null: false, foreign_key: true
      t.string :status, null: false
      t.timestamps
    end

    add_index :shopping_trip_items, [:shopping_trip_id, :item_id], unique: true
  end
end

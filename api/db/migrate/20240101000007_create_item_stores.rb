class CreateItemStores < ActiveRecord::Migration[8.0]
  def change
    create_table :item_stores do |t|
      t.references :item, null: false, foreign_key: true
      t.references :store, null: false, foreign_key: true

      t.timestamps
    end

    add_index :item_stores, [:item_id, :store_id], unique: true
  end
end

class CreateItems < ActiveRecord::Migration[8.0]
  def change
    create_table :items do |t|
      t.string :name, null: false
      t.text :notes
      t.references :category, null: true, foreign_key: true
      t.references :household, null: false, foreign_key: true
      t.boolean :on_list, null: false, default: false
      t.datetime :purchased_at
      t.bigint :added_by_user_id
      t.bigint :updated_by_user_id

      t.timestamps
    end

    add_index :items, :household_id
    add_index :items, [:household_id, :on_list]
    add_index :items, :purchased_at
    add_foreign_key :items, :users, column: :added_by_user_id
    add_foreign_key :items, :users, column: :updated_by_user_id
  end
end

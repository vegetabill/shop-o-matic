class AddPriorityToItems < ActiveRecord::Migration[8.0]
  def change
    add_column :items, :priority, :string, null: false, default: "none"
  end
end

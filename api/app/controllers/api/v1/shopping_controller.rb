module Api
  module V1
    class ShoppingController < ApplicationController
      # POST /api/v1/households/:household_id/shopping/end
      # Ends shopping mode: checked-off items get on_list=false so they move to history
      def end
        purchased_item_ids = Array(params[:purchased_item_ids])
        store_id = params[:store_id]

        if purchased_item_ids.any?
          updates = { on_list: false, purchased_at: nil, last_purchased_at: Time.current, updated_at: Time.current }
          updates[:last_purchased_store_id] = store_id if store_id.present?

          current_household.items
            .where(id: purchased_item_ids)
            .update_all(updates)
        end

        render json: { message: "Shopping mode ended" }, status: :ok
      end
    end
  end
end

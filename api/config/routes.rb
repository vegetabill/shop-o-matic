Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      # Auth
      post "auth/auth0", to: "auth#auth0"

      # Households
      resources :households, only: [:index, :create, :show] do
        collection do
          post :join
        end

        # Stores nested under household
        resources :stores, only: [:index, :create, :update, :destroy]

        # Categories nested under household
        resources :categories, only: [:index, :create, :update, :destroy]

        # Items nested under household
        resources :items, only: [:index, :create, :update] do
          member do
            post :add_to_list
            post :purchase
            post :unpurchase
            post :mark_unavailable
          end
        end

        # Shopping mode
        get  "shopping/active", to: "shopping#active"
        post "shopping/pause",  to: "shopping#pause"
        post "shopping/end",    to: "shopping#end"
      end
    end
  end

  # Health check
  get "/health", to: proc { [200, {}, [{ status: "ok" }.to_json]] }

  # Admin portal
  namespace :admin do
    get    "login",        to: "sessions#new",      as: :login
    get    "auth/start",   to: "sessions#start",    as: :auth_start
    get    "auth/callback",to: "sessions#callback", as: :callback
    delete "logout",       to: "sessions#destroy",  as: :logout
    root "users#index"
    resources :users
    resources :households do
      member do
        delete "members/:user_id", to: "households#remove_member", as: :remove_member
        post :add_member
      end
    end
  end

  # Landing page
  root "home#index"

  get '/privacy', to: redirect("/privacy-policy.html")
end

class JwtService
  def self.encode(payload)
    expiry = Time.current + JWT_EXPIRY_HOURS.hours
    payload = payload.merge(exp: expiry.to_i, iat: Time.current.to_i)
    JWT.encode(payload, JWT_SECRET, JWT_ALGORITHM)
  end

  def self.decode(token)
    decoded = JWT.decode(token, JWT_SECRET, true, { algorithm: JWT_ALGORITHM })
    HashWithIndifferentAccess.new(decoded.first)
  rescue JWT::ExpiredSignature
    raise AuthenticationError, "Token has expired"
  rescue JWT::DecodeError => e
    raise AuthenticationError, "Invalid token: #{e.message}"
  end

  def self.token_for_user(user)
    encode({ user_id: user.id, email: user.email })
  end
end

package com.gameshop.service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
public class StripeService {

    @Value("${stripe.secret.key}")
    private String secretKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = secretKey;
    }

    public PaymentIntent createPaymentIntent(Long amount, String currency, String description, String metadata) throws StripeException {
        PaymentIntentCreateParams.Builder paramsBuilder = PaymentIntentCreateParams.builder()
            .setAmount(amount)
            .setCurrency(currency)
            .setDescription(description)
            .setAutomaticPaymentMethods(
                PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                    .setEnabled(true)
                    .build()
            );

        if (metadata != null) {
            paramsBuilder.putMetadata("order_info", metadata);
        }

        PaymentIntentCreateParams params = paramsBuilder.build();
        return PaymentIntent.create(params);
    }

    public PaymentIntent retrievePaymentIntent(String paymentIntentId) throws StripeException {
        return PaymentIntent.retrieve(paymentIntentId);
    }
}

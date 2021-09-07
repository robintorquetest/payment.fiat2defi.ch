import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ActivityIndicator } from "react-native-paper";
import { DeFiButton } from "../../elements/Buttons";
import { SpacerV } from "../../elements/Spacers";
import { Alert } from "../../elements/Texts";
import { ApiError } from "../../models/ApiDto";
import { Asset } from "../../models/Asset";
import { BuyRoute } from "../../models/BuyRoute";
import { getAssets, postBuyRoute, putBuyRoute } from "../../services/ApiService";
import NotificationService from "../../services/NotificationService";
import { createRules } from "../../utils/Utils";
import Validations from "../../utils/Validations";
import DeFiPicker from "../form/DeFiPicker";
import Form from "../form/Form";
import Input from "../form/Input";
import ButtonContainer from "../util/ButtonContainer";

const BuyRouteEdit = ({
  routes,
  onRouteCreated,
}: {
  routes?: BuyRoute[];
  onRouteCreated: (route: BuyRoute) => void;
}) => {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BuyRoute>();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>();
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    getAssets()
      .then(setAssets)
      .catch(() => NotificationService.show(t("feedback.load_failed")))
      .finally(() => setIsLoading(false));
  }, []);

  const onSubmit = (route: BuyRoute) => {
    setIsSaving(true);
    setError(undefined);

    // re-activate the route, if it already existed
    const existingRoute = routes?.find((r) => !r.active && r.asset.id === route.asset.id && r.iban.split(' ').join('') === route.iban.split(' ').join(''));
    if (existingRoute) existingRoute.active = true;

    (existingRoute ? putBuyRoute(existingRoute) : postBuyRoute(route))
      .then(onRouteCreated)
      .catch((error: ApiError) => setError(error.statusCode == 409 ? 'model.route.conflict' : ''))
      .finally(() => setIsSaving(false));
  };

  const rules: any = createRules({
    asset: Validations.Required,
    iban: [Validations.Required, Validations.Iban]
  });

  return isLoading ? (
    <ActivityIndicator size="large" />
  ) : (
    <Form control={control} rules={rules} errors={errors} disabled={isSaving} onSubmit={handleSubmit(onSubmit)}>
      <DeFiPicker
        name="asset"
        label={t("model.route.asset")}
        items={assets.filter((a) => a.buyable)}
        idProp="id"
        labelProp="name"
      />
      <SpacerV />

      <Input name="iban" label={t("model.route.your_iban")} placeholder="DE89 3704 0044 0532 0130 00" />
      <SpacerV />

      {error != null && (
        <>
          <Alert label={`${t("feedback.save_failed")} ${t(error)}`} />
          <SpacerV />
        </>
      )}

      <ButtonContainer>
        <DeFiButton mode="contained" loading={isSaving} onPress={handleSubmit(onSubmit)}>
          {t("action.save")}
        </DeFiButton>
      </ButtonContainer>
    </Form>
  );
};

export default BuyRouteEdit;

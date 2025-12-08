"use client";
import Container from "@/components/ui/Container/Container";
import UpperDescription from "@/components/ui/UpperDescription/UpperDescription";
import s from "./CalculateSection.module.css";
import { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";

type CalculatorValues = {
  rentPerHour: string;
  averageTrainingCost: string;
  boardsCount: string;
  trainingsPerWeek: string;
};

const initialValues: CalculatorValues = {
  rentPerHour: "",
  averageTrainingCost: "",
  boardsCount: "",
  trainingsPerWeek: "",
};

// Значення за замовчуванням для розрахунків
const DEFAULT_HOURS_PER_DAY = 2;
const DEFAULT_WORKING_DAYS_PER_WEEK = 5;
const DEFAULT_BOARD_PRICE = 6000; // ₴
const DEFAULT_TRAINING_TYPE_COST = 6000; // Онлайн навчання

const formatCurrency = (value: number) => {
  if (!Number.isFinite(value)) return "0";
  return new Intl.NumberFormat("uk-UA").format(Math.round(value));
};

const toNumber = (value: string | number | undefined | null) => {
  if (value === null || value === undefined) return 0;
  // Якщо вже число, повертаємо його
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  // Якщо рядок, обробляємо його
  if (typeof value === "string") {
    if (!value.trim()) return 0;
    const normalized = value.replace(",", ".").trim();
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

type CalculationResults = {
  weeklyIncome: number;
  monthlyIncome: number;
  weeklyExpenses: number;
  totalInvestment: number;
};

export default function CalculateSection() {
  const [isMobile, setIsMobile] = useState(false);
  const [calculationResults, setCalculationResults] = useState<CalculationResults | null>(null);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 1000px)");
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      // supports both addEventListener and initial call
      setIsMobile("matches" in e ? e.matches : (e as MediaQueryList).matches);
    };
    handler(mql);
    const listener = (ev: MediaQueryListEvent) => handler(ev);
    if (mql.addEventListener) mql.addEventListener("change", listener);
    else mql.addListener(listener);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", listener);
      else mql.removeListener(listener);
    };
  }, []);

  return (
    <section className={s.section}>
      <Container>
        <div className={s.topBlock}>
          <UpperDescription>Калькулятор дохідності</UpperDescription>
          <h2>Розрахуйте окупність вашого проєкту BFB</h2>
        </div>
        <Formik
          onSubmit={(values) => {
            const rentPerHour = toNumber(values.rentPerHour);
            const averageTrainingCost = toNumber(values.averageTrainingCost);
            const boardsCount = toNumber(values.boardsCount);
            const trainingsPerWeek = toNumber(values.trainingsPerWeek);

            // Використовуємо значення за замовчуванням для прихованих параметрів
            const hoursPerDay = DEFAULT_HOURS_PER_DAY;
            const workingDaysPerWeek = DEFAULT_WORKING_DAYS_PER_WEEK;
            const boardPrice = DEFAULT_BOARD_PRICE;
            const trainingTypeCost = DEFAULT_TRAINING_TYPE_COST;

            const weeklyIncome =
              averageTrainingCost * trainingsPerWeek * boardsCount - rentPerHour;
            const monthlyIncome = weeklyIncome * 4;
            const weeklyExpenses = rentPerHour * hoursPerDay * workingDaysPerWeek;
            const totalInvestment =
              boardPrice * boardsCount + weeklyExpenses * 4 + trainingTypeCost;

            setCalculationResults({
              weeklyIncome,
              monthlyIncome,
              weeklyExpenses,
              totalInvestment,
            });
          }}
          initialValues={initialValues}
        >
          {({ values }) => {
            const isFormFilled =
              values.rentPerHour &&
              values.averageTrainingCost &&
              values.boardsCount &&
              values.trainingsPerWeek;

            return (
              <div className={s.content}>
                <div className={s.calculatorContainer}>
                  <h3>
                    Дізнайтесь, коли повернете вкладення — заповніть кілька полів.
                  </h3>
                  <Form className={s.form}>
                    <div className={s.fields}>
                      <Field
                        as="input"
                        type={"number"}
                        name="rentPerHour"
                        placeholder="Ціна оренди зали за годину"
                      />
                      <Field
                        as="input"
                        type={"number"}
                        name="boardsCount"
                        placeholder="Бажана кількість бордів"
                      />
                      <Field
                        as="input"
                        type={"number"}
                        name="averageTrainingCost"
                        placeholder="Середня вартість тренування для клієнта"
                      />
                      <Field
                        as="input"
                        type={"number"}
                        name="trainingsPerWeek"
                        placeholder="Кількість тренувань на тиждень"
                      />
                    </div>
                    <button type="submit" disabled={!isFormFilled}>
                      Розрахувати окупність
                    </button>
                  </Form>
                </div>
                <div className={s.statistics}>
                  <h3>Загальний дохід</h3>
                  <ul>
                    <li>
                      <h4>Загальні вкладення</h4>
                      <p>
                        {calculationResults
                          ? formatCurrency(calculationResults.totalInvestment)
                          : "0"}{" "}
                        ₴
                      </p>
                    </li>
                    <li>
                      <h4>Витрати на тиждень</h4>
                      <p>
                        {calculationResults
                          ? formatCurrency(calculationResults.weeklyExpenses)
                          : "0"}{" "}
                        ₴
                      </p>
                    </li>
                    <li>
                      <h4>Дохід за місяць</h4>
                      <p>
                        {calculationResults
                          ? formatCurrency(calculationResults.monthlyIncome)
                          : "0"}{" "}
                        ₴
                      </p>
                    </li>
                    {isMobile && (
                      <li className={s.weekIncome}>
                        <h4>Дохід за тиждень</h4>
                        <p>
                          {calculationResults
                            ? formatCurrency(calculationResults.weeklyIncome)
                            : "0"}{" "}
                          ₴
                        </p>
                      </li>
                    )}
                  </ul>
                  {!isMobile && (
                    <div className={s.weekIncomeDesktop}>
                      <h4>Дохід за тиждень</h4>
                      <p>
                        {calculationResults
                          ? formatCurrency(calculationResults.weeklyIncome)
                          : "0"}{" "}
                        ₴
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          }}
        </Formik>
      </Container>
    </section>
  );
}

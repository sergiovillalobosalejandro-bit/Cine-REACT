import { useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2 } from "lucide-react";
import type { MovieList } from "../../application/ports/library-repository.js";
import { TEXTS } from "../texts/es.js";

const normalizeName = (name: string) => name.trim().toLowerCase();

const createListSchema = (existingNames: string[]) =>
  z.object({
    name: z
      .string()
      .min(3, "El nombre debe tener al menos 3 caracteres")
      .max(60, "El nombre no puede exceder 60 caracteres")
      .refine(
        (val) => !existingNames.includes(normalizeName(val)),
        "Ya existe una lista con ese nombre",
      ),
    description: z
      .string()
      .max(280, "La descripción no puede exceder 280 caracteres")
      .optional()
      .or(z.literal("")),
  });

type ListFormData = z.infer<ReturnType<typeof createListSchema>>;

interface ListFormProps {
  initialData?: Partial<MovieList> | undefined;
  existingListNames: string[];
  onSubmit: (data: ListFormData) => Promise<void>;
  onClose: () => void;
  title: string;
  isPending: boolean;
}

export function ListForm({
  initialData,
  existingListNames,
  onSubmit,
  onClose,
  title,
  isPending,
}: ListFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const firstErrorRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(
    null,
  );
  const errorId = "list-form-error";
  const errorLiveId = "list-form-error-live";

  const otherNames = initialData?.name
    ? existingListNames.filter(
        (n) => normalizeName(n) !== normalizeName(initialData.name!),
      )
    : existingListNames;

  const schema = createListSchema(otherNames);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<ListFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    const firstInvalid = formRef.current?.querySelector<
      HTMLInputElement | HTMLTextAreaElement
    >("[aria-invalid='true']");
    if (firstInvalid) {
      firstErrorRef.current = firstInvalid;
      firstInvalid.focus();
    }
  }, [errors]);

  const handleFormSubmit = async (data: ListFormData) => {
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setError("name", { type: "server", message: err.message });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 flex flex-col gap-4 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="list-form-title"
        aria-describedby={
          Object.keys(errors).length > 0 ? errorLiveId : undefined
        }
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 id="list-form-title" className="text-lg font-bold text-slate-100">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="text-slate-400 hover:text-slate-200 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div
          id={errorLiveId}
          role="alert"
          aria-live="polite"
          className="sr-only"
        >
          {Object.values(errors)
            .map((e) => e.message)
            .join(", ")}
        </div>

        <form
          ref={formRef}
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex flex-col gap-4"
          noValidate
        >
          <div className="flex flex-col gap-1">
            <label
              htmlFor="list-name"
              className="font-semibold text-slate-300 text-xs"
            >
              {TEXTS.library.listNameLabel}
            </label>
            <input
              id="list-name"
              type="text"
              {...register("name")}
              placeholder={TEXTS.library.listNamePlaceholder}
              className={`bg-slate-800 text-slate-100 placeholder-slate-500 p-2.5 rounded-xl border focus:outline-none focus:border-indigo-500 text-xs ${
                errors.name
                  ? "border-rose-500 focus:border-rose-500"
                  : "border-slate-700"
              }`}
              aria-invalid={errors.name ? "true" : "false"}
              aria-describedby={errors.name ? `${errorId}-name` : undefined}
              disabled={isPending}
            />
            {errors.name && (
              <p
                id={`${errorId}-name`}
                className="text-xs text-rose-400"
                role="alert"
              >
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="list-description"
              className="font-semibold text-slate-300 text-xs"
            >
              {TEXTS.library.listDescLabel}
            </label>
            <textarea
              id="list-description"
              {...register("description")}
              placeholder={TEXTS.library.listDescPlaceholder}
              rows={3}
              className={`bg-slate-800 text-slate-100 placeholder-slate-500 p-2.5 rounded-xl border resize-none focus:outline-none focus:border-indigo-500 text-xs ${
                errors.description
                  ? "border-rose-500 focus:border-rose-500"
                  : "border-slate-700"
              }`}
              aria-invalid={errors.description ? "true" : "false"}
              aria-describedby={
                errors.description ? `${errorId}-desc` : undefined
              }
              disabled={isPending}
            />
            {errors.description && (
              <p
                id={`${errorId}-desc`}
                className="text-xs text-rose-400"
                role="alert"
              >
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {TEXTS.library.cancel}
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{TEXTS.library.save}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

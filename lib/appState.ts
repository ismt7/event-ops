"use client";

import dayjs from "dayjs";

type Config = typeof import("@/event-ops.config").default;

export interface Template {
  id: string;
  name: string;
  text: string;
}

export interface Link {
  id: string;
  name: string;
  url: string;
}

export interface AppState {
  config: Config;
  zoomUrl: string;
  youtubeUrl: string;
  surveyUrl: string;
  slidoUrl: string;
  connpassUrl: string;
  eventDate: string;
  eventTitle: string;
  eventDescription: string;
  templates: Template[];
  selectedTemplateId: string | null;
  templateText: string;
  templateName: string;
  activeTab: string;
  links: Link[];
  isModalOpen: boolean;
  newLinkName: string;
  newLinkUrl: string;
  showTemplateVariables: boolean;
  urlErrors: Partial<Record<UrlField, string>>;
  urlTouched: Partial<Record<UrlField, boolean>>;
}

export type EventData = Pick<
  AppState,
  | "zoomUrl"
  | "youtubeUrl"
  | "surveyUrl"
  | "slidoUrl"
  | "connpassUrl"
  | "eventDate"
  | "eventTitle"
  | "eventDescription"
  | "templates"
  | "links"
>;

export type UrlField =
  | "zoomUrl"
  | "youtubeUrl"
  | "surveyUrl"
  | "slidoUrl"
  | "connpassUrl";

export const SHORT_URL_TYPES = ["zoom", "youtube", "survey", "slido"] as const;
export type ShortUrlType = (typeof SHORT_URL_TYPES)[number];

export const buildShortUrl = ({
  baseUrl,
  prefix,
  date,
  type,
}: {
  baseUrl: string;
  prefix: string;
  date: string;
  type: ShortUrlType;
}) => `${baseUrl}/${prefix}${date}-${type}`;

export const buildEventCode = ({
  prefix,
  date,
}: {
  prefix: string;
  date: string;
}) => `${prefix}${date.slice(2)}`;

export const LEGACY_STORAGE_KEYS = [
  "config",
  "zoomUrl",
  "youtubeUrl",
  "surveyUrl",
  "slidoUrl",
  "connpassUrl",
  "eventDate",
  "eventTitle",
  "eventDescription",
  "templates",
  "links",
] as const;

export type PersistedState = Pick<
  AppState,
  (typeof LEGACY_STORAGE_KEYS)[number]
>;

export const createDefaultState = (
  config: Config
): AppState => ({
  config,
  zoomUrl: "",
  youtubeUrl: "",
  surveyUrl: "",
  slidoUrl: "",
  connpassUrl: "",
  eventDate: dayjs().format("YYYY-MM-DD"),
  eventTitle: "",
  eventDescription: "",
  templates: [],
  selectedTemplateId: null,
  templateText: "",
  templateName: "",
  activeTab: "編集",
  links: [],
  isModalOpen: false,
  newLinkName: "",
  newLinkUrl: "",
  showTemplateVariables: true,
  urlErrors: {},
  urlTouched: {},
});

export const initState = (base: AppState, storage: Storage): AppState => {
  const persisted = storage.getItem<PersistedState>("appState");
  if (persisted) {
    return { ...base, ...persisted };
  }

  return {
    ...base,
    config: storage.getItem<Config>("config") ?? base.config,
    zoomUrl: storage.getItem<string>("zoomUrl") ?? base.zoomUrl,
    youtubeUrl: storage.getItem<string>("youtubeUrl") ?? base.youtubeUrl,
    surveyUrl: storage.getItem<string>("surveyUrl") ?? base.surveyUrl,
    slidoUrl: storage.getItem<string>("slidoUrl") ?? base.slidoUrl,
    connpassUrl: storage.getItem<string>("connpassUrl") ?? base.connpassUrl,
    eventDate: storage.getItem<string>("eventDate") ?? base.eventDate,
    eventTitle: storage.getItem<string>("eventTitle") ?? base.eventTitle,
    eventDescription:
      storage.getItem<string>("eventDescription") ?? base.eventDescription,
    templates: storage.getItem<Template[]>("templates") ?? base.templates,
    links: storage.getItem<Link[]>("links") ?? base.links,
  };
};

const createPersistedState = (state: AppState): PersistedState => ({
  config: state.config,
  zoomUrl: state.zoomUrl,
  youtubeUrl: state.youtubeUrl,
  surveyUrl: state.surveyUrl,
  slidoUrl: state.slidoUrl,
  connpassUrl: state.connpassUrl,
  eventDate: state.eventDate,
  eventTitle: state.eventTitle,
  eventDescription: state.eventDescription,
  templates: state.templates,
  links: state.links,
});

export const persistAppState = (storage: Storage, state: AppState) => {
  storage.setItem("appState", createPersistedState(state));
};

export const migrateLegacyState = (storage: Storage, state: AppState) => {
  const hasLegacyData = LEGACY_STORAGE_KEYS.some(
    (key) => storage.getItem<unknown>(key) !== null
  );
  if (!hasLegacyData) return false;

  if (storage.getItem<PersistedState>("appState") === null) {
    persistAppState(storage, state);
  }

  LEGACY_STORAGE_KEYS.forEach((key) => storage.removeItem(key));
  return true;
};

type SetFieldActionMap = {
  [K in keyof AppState]: { type: "SET_FIELD"; field: K; value: AppState[K] };
}[keyof AppState];

export type Action =
  | SetFieldActionMap
  | { type: "SET_CONFIG"; value: Config }
  | { type: "SET_TEMPLATES"; value: Template[] }
  | { type: "SET_LINKS"; value: Link[] }
  | { type: "SET_SELECTED_TEMPLATE_ID"; value: string | null }
  | { type: "SET_URL_ERROR"; field: UrlField; value: string }
  | { type: "SET_URL_TOUCHED"; field: UrlField; value: boolean }
  | { type: "SELECT_TEMPLATE"; value: { id: string; name: string; text: string } }
  | { type: "ADD_TEMPLATE"; value: Template }
  | {
      type: "UPDATE_TEMPLATE";
      value: { id: string; name: string; text: string };
    }
  | { type: "DELETE_TEMPLATE"; value: { id: string } }
  | { type: "ADD_LINK"; value: Link }
  | { type: "REMOVE_LINK"; value: { id: string } }
  | {
      type: "IMPORT_CONFIG";
      value: { config: Config };
    }
  | { type: "IMPORT_EVENT_DATA"; value: EventData }
  | { type: "RESET"; value: AppState };

export const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_CONFIG":
      return { ...state, config: action.value };
    case "SET_TEMPLATES":
      return { ...state, templates: action.value };
    case "SET_LINKS":
      return { ...state, links: action.value };
    case "SET_SELECTED_TEMPLATE_ID":
      return { ...state, selectedTemplateId: action.value };
    case "SET_URL_ERROR":
      return {
        ...state,
        urlErrors: { ...state.urlErrors, [action.field]: action.value },
      };
    case "SET_URL_TOUCHED":
      return {
        ...state,
        urlTouched: { ...state.urlTouched, [action.field]: action.value },
      };
    case "SELECT_TEMPLATE":
      return {
        ...state,
        selectedTemplateId: action.value.id,
        templateName: action.value.name,
        templateText: action.value.text,
      };
    case "ADD_TEMPLATE":
      return {
        ...state,
        templates: [...state.templates, action.value],
        selectedTemplateId: action.value.id,
      };
    case "UPDATE_TEMPLATE":
      return {
        ...state,
        templates: state.templates.map((template) =>
          template.id === action.value.id
            ? {
                ...template,
                name: action.value.name,
                text: action.value.text,
              }
            : template
        ),
      };
    case "DELETE_TEMPLATE":
      return {
        ...state,
        templates: state.templates.filter(
          (template) => template.id !== action.value.id
        ),
        selectedTemplateId: null,
        templateName: "",
        templateText: "",
      };
    case "ADD_LINK":
      return {
        ...state,
        links: [...state.links, action.value],
        newLinkName: "",
        newLinkUrl: "",
        isModalOpen: false,
      };
    case "REMOVE_LINK":
      return {
        ...state,
        links: state.links.filter((link) => link.id !== action.value.id),
      };
    case "IMPORT_CONFIG":
      return {
        ...state,
        config: action.value.config,
      };
    case "IMPORT_EVENT_DATA":
      return {
        ...state,
        zoomUrl: action.value.zoomUrl,
        youtubeUrl: action.value.youtubeUrl,
        surveyUrl: action.value.surveyUrl,
        slidoUrl: action.value.slidoUrl,
        connpassUrl: action.value.connpassUrl,
        eventDate: action.value.eventDate,
        eventTitle: action.value.eventTitle,
        eventDescription: action.value.eventDescription,
        templates: action.value.templates,
        links: action.value.links,
      };
    case "RESET":
      return action.value;
    default:
      return state;
  }
};

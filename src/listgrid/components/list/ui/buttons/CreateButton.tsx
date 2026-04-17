'use client';

import React from "react";
import {SubCollectionBaseButtonProps} from "../../types/SubCollectionButtons.type";
import {useListGridTheme} from "../../context/ListGridThemeContext";

export interface CreateButtonProps {
  ableDelete: boolean;
  activeTrashIcon: boolean;
  deleteItems: () => void;
  buttons?: ((props: SubCollectionBaseButtonProps) => React.ReactNode)[];
  buttonProps: SubCollectionBaseButtonProps;
  ableAdd: boolean;
  setOpen: (open: boolean) => void;
  setRenderKey: (key: number) => void;
}

export const CreateButton: React.FC<CreateButtonProps> = ({
  ableDelete,
  activeTrashIcon,
  deleteItems,
  buttons,
  buttonProps,
  ableAdd,
  setOpen,
  setRenderKey,
}) => {
  const { classNames: themeClasses } = useListGridTheme();

  const deleteButtonClass = themeClasses.subCollectionButtons?.deleteButton ?? "btn btn-outline-danger";
  const addButtonClass = themeClasses.subCollectionButtons?.addButton ?? "btn btn-primary";

  return (
    <>
      {ableDelete && activeTrashIcon && (
        <button className={deleteButtonClass} onClick={deleteItems}>
          삭제
        </button>
      )}
      {buttons?.map((buttonFunc, index) => (
        <React.Fragment key={index}>{buttonFunc(buttonProps)}</React.Fragment>
      ))}
      {ableAdd && (
        <button
          className={addButtonClass}
          onClick={() => {
            setRenderKey(new Date().getTime());
            setOpen(true);
          }}
        >
          신규 입력
        </button>
      )}
    </>
  );
};

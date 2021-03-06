import * as React from "react";
import { Row, Col, FBSelect } from "../ui";
import { t } from "i18next";
import {
  generateList
} from "./step_tiles/tile_move_absolute/generate_list";
import { InputBox } from "./step_tiles/tile_move_absolute/input_box";
import { convertDDItoScopeDeclr } from "./step_tiles/tile_move_absolute/handle_select";
import { ParentVariableFormProps, LocalsListProps, PARENT } from "./locals_list_support";
import { defensiveClone, betterCompact } from "../util/util";
import {
  Xyz,
  ScopeDeclaration,
  TaggedSequence,
} from "farmbot";
import { overwrite } from "../api/crud";

interface AxisEditProps {
  sequence: TaggedSequence;
  axis: Xyz;
  onChange: (sd: ScopeDeclaration) => void;
}

export const manuallyEditAxis = ({ sequence, axis, onChange }: AxisEditProps) =>
  (e: React.SyntheticEvent<HTMLInputElement>) => {
    const num = parseFloat(e.currentTarget.value);
    const locals = defensiveClone(sequence.body.args.locals);
    locals.body = locals.body || [];
    const [declaration] = locals.body;
    if (declaration &&
      declaration.kind === "variable_declaration" &&
      declaration.args.data_value.kind === "coordinate") {
      declaration.args.data_value.args[axis] = num;
      !isNaN(num) && onChange(locals);
    }
  };

/** When sequence.args.locals actually has variables, render this form.
 * Allows the user to chose the value of the `parent` variable, etc. */
export const ParentVariableForm =
  (props: ParentVariableFormProps) => {
    const { sequence, resources, onChange } = props;
    const { x, y, z } = props.parent.location;
    const isDisabled = !props.parent.editable;
    const list = generateList(resources, [PARENT]);
    return <div className="parent-variable-form">
      <Row>
        <Col xs={12}>
          <h5>{t("Import Coordinates From")}</h5>
          <FBSelect
            key={JSON.stringify(sequence)}
            allowEmpty={true}
            list={list}
            selectedItem={props.parent.dropdown}
            onChange={ddi => onChange(convertDDItoScopeDeclr(ddi))} />
        </Col>
      </Row>
      <Row>
        <Col xs={4}>
          <InputBox
            onCommit={manuallyEditAxis({ ...props, axis: "x" })}
            disabled={isDisabled}
            name="location-x-variabledeclr"
            value={"" + x}>
            {t("X (mm)")}
          </InputBox>
        </Col>
        <Col xs={4}>
          <InputBox
            onCommit={manuallyEditAxis({ ...props, axis: "y" })}
            disabled={isDisabled}
            name="location-y-variabledeclr"
            value={"" + y}>
            {t("Y (mm)")}
          </InputBox>
        </Col>
        <Col xs={4}>
          <InputBox
            onCommit={manuallyEditAxis({ ...props, axis: "z" })}
            name="location-z-variabledeclr"
            disabled={isDisabled}
            value={"" + z}>
            {t("Z (mm)")}
          </InputBox>
        </Col>
      </Row>
    </div>;
  };

interface LocalListCbProps {
  dispatch: Function;
  sequence: TaggedSequence;
}

export const localListCallback =
  ({ dispatch, sequence }: LocalListCbProps) => (locals: ScopeDeclaration) => {
    const clone = defensiveClone(sequence.body); // unfortunate
    clone.args.locals = locals;
    dispatch(overwrite(sequence, clone));
  };

/** List of local variable declarations for a sequence. If no variables are
 * found, shows nothing. */
export const LocalsList = (props: LocalsListProps) => {
  return <div className="locals-list">
    {betterCompact(Object.values(props.variableData)).map(val =>
      <ParentVariableForm
        key={val.celeryNode.args.label}
        parent={val}
        sequence={props.sequence}
        resources={props.resources}
        onChange={props.onChange} />)}
  </div>;
};

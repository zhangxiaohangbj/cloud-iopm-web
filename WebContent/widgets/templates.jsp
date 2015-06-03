<script type="text/html" id="ui-select">
{{if list}}
    <select{{if id}} id="{{id}}"{{/if}}{{if name}} name="{{name}}"{{/if}}{{if className}} class="{{className}}"{{/if}}{{if multiple}} multiple="multiple"{{/if}}>
    {{each list as item i}}
        {{if item.value}}
        <option index="{{i}}" value="{{item.value}}">{{item.label || item.value}}</option>
        {{else if item.list}}
        <optgroup index="{{i}}" label="{{item.label}}">
        {{each item.list as opt j}}
            <option index="{{i}}{{j}}" value="{{opt.value}}">{{opt.label || opt.value}}</option>
        {{/each}}
        </optgroup>
        {{/if}}
    {{/each}}
    </select>
{{/if}}
</script>
